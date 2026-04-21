import { and, asc, between, eq, sql } from "drizzle-orm";
import {
  documento,
  documentoLinea,
  proveedor,
  kardexMovimiento,
  articulo,
  almacen,
} from "@perunor/db";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

const FECHA_RE = /^\d{4}-\d{2}-\d{2}$/;

function validarRango(desde: string, hasta: string) {
  if (!FECHA_RE.test(desde) || !FECHA_RE.test(hasta)) {
    throw new GraphQLError("Fechas inválidas (YYYY-MM-DD)", { extensions: { code: "BAD_USER_INPUT" } });
  }
  if (desde > hasta) {
    throw new GraphQLError("'desde' debe ser <= 'hasta'", { extensions: { code: "BAD_USER_INPUT" } });
  }
}

function sumStrings(nums: Array<string | number | null>): string {
  let total = 0;
  for (const n of nums) total += Number(n ?? 0);
  return total.toFixed(4);
}

export const reporteResolvers = {
  Query: {
    reporteCompras: async (
      _: unknown,
      { desde, hasta, proveedorId }: { desde: string; hasta: string; proveedorId?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      validarRango(desde, hasta);

      const conditions = [
        eq(documento.tipo, "compra"),
        eq(documento.estado, "confirmado"),
        between(documento.fecha, desde, hasta),
      ] as any[];
      if (proveedorId) conditions.push(eq(documento.proveedorId, proveedorId));

      const filas = await db
        .select({
          documentoId: documento.id,
          numero: documento.numero,
          fecha: documento.fecha,
          estado: documento.estado,
          proveedorId: documento.proveedorId,
          proveedorNombre: proveedor.nombre,
          proveedorRuc: proveedor.ruc,
          subtotal: documento.subtotal,
          igv: documento.igv,
          total: documento.total,
          lineas: sql<number>`(SELECT COUNT(*)::int FROM documento_linea dl WHERE dl.documento_id = ${documento.id})`,
        })
        .from(documento)
        .leftJoin(proveedor, eq(documento.proveedorId, proveedor.id))
        .where(and(...conditions))
        .orderBy(asc(documento.fecha), asc(documento.numero));

      const detalle = filas.map((f) => ({
        documentoId: f.documentoId,
        numero: f.numero,
        fecha: f.fecha,
        estado: f.estado,
        proveedorId: f.proveedorId,
        proveedorNombre: f.proveedorNombre,
        proveedorRuc: f.proveedorRuc,
        lineas: Number(f.lineas),
        subtotal: f.subtotal,
        igv: f.igv,
        total: f.total,
      }));

      const porProveedorMap = new Map<string, {
        proveedorId: string | null;
        proveedorNombre: string | null;
        proveedorRuc: string | null;
        documentos: number;
        subtotal: number;
        igv: number;
        total: number;
      }>();

      for (const d of detalle) {
        const key = d.proveedorId ?? "__sin__";
        const agg = porProveedorMap.get(key) ?? {
          proveedorId: d.proveedorId,
          proveedorNombre: d.proveedorNombre,
          proveedorRuc: d.proveedorRuc,
          documentos: 0,
          subtotal: 0,
          igv: 0,
          total: 0,
        };
        agg.documentos += 1;
        agg.subtotal += Number(d.subtotal);
        agg.igv += Number(d.igv);
        agg.total += Number(d.total);
        porProveedorMap.set(key, agg);
      }

      const porProveedor = Array.from(porProveedorMap.values())
        .map((a) => ({
          proveedorId: a.proveedorId,
          proveedorNombre: a.proveedorNombre,
          proveedorRuc: a.proveedorRuc,
          documentos: a.documentos,
          subtotal: a.subtotal.toFixed(4),
          igv: a.igv.toFixed(4),
          total: a.total.toFixed(4),
        }))
        .sort((a, b) => Number(b.total) - Number(a.total));

      return {
        desde,
        hasta,
        detalle,
        porProveedor,
        totales: {
          documentos: detalle.length,
          subtotal: sumStrings(detalle.map((d) => d.subtotal)),
          igv: sumStrings(detalle.map((d) => d.igv)),
          total: sumStrings(detalle.map((d) => d.total)),
        },
      };
    },

    reporteMovimientos: async (
      _: unknown,
      {
        desde,
        hasta,
        almacenId,
        articuloId,
      }: { desde: string; hasta: string; almacenId?: string; articuloId?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      validarRango(desde, hasta);

      const desdeTs = new Date(`${desde}T00:00:00Z`);
      const hastaTs = new Date(`${hasta}T23:59:59.999Z`);

      const conditions = [between(kardexMovimiento.fecha, desdeTs, hastaTs)] as any[];
      if (almacenId) conditions.push(eq(kardexMovimiento.almacenId, almacenId));
      if (articuloId) conditions.push(eq(kardexMovimiento.articuloId, articuloId));

      const filas = await db
        .select({
          id: kardexMovimiento.id,
          fecha: kardexMovimiento.fecha,
          articuloId: kardexMovimiento.articuloId,
          articuloCodigo: articulo.codigo,
          articuloNombre: articulo.nombre,
          unidad: articulo.unidadMedida,
          almacenId: kardexMovimiento.almacenId,
          almacenNombre: almacen.nombre,
          movimiento: kardexMovimiento.movimiento,
          cantidad: kardexMovimiento.cantidad,
          costoUnitario: kardexMovimiento.costoUnitario,
          costoTotal: kardexMovimiento.costoTotal,
          saldoCantidad: kardexMovimiento.saldoCantidad,
          referencia: kardexMovimiento.referencia,
        })
        .from(kardexMovimiento)
        .innerJoin(articulo, eq(kardexMovimiento.articuloId, articulo.id))
        .innerJoin(almacen, eq(kardexMovimiento.almacenId, almacen.id))
        .where(and(...conditions))
        .orderBy(asc(kardexMovimiento.fecha), asc(kardexMovimiento.creadoEn));

      const items = filas.map((f) => ({
        ...f,
        fecha: f.fecha.toISOString(),
      }));

      let totalIngresos = 0;
      let totalEgresos = 0;
      let valorIngresos = 0;
      let valorEgresos = 0;
      for (const i of items) {
        const cant = Number(i.cantidad);
        const val = Number(i.costoTotal);
        if (i.movimiento === "ingreso") {
          totalIngresos += cant;
          valorIngresos += val;
        } else {
          totalEgresos += cant;
          valorEgresos += val;
        }
      }

      return {
        desde,
        hasta,
        items,
        totalIngresos: totalIngresos.toFixed(4),
        totalEgresos: totalEgresos.toFixed(4),
        valorIngresos: valorIngresos.toFixed(4),
        valorEgresos: valorEgresos.toFixed(4),
      };
    },
  },
};
