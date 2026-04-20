import { and, desc, eq, ilike, count, sql } from "drizzle-orm";
import {
  documento,
  documentoLinea,
  contadorDocumento,
  outboxEvento,
  articulo,
  almacen,
  proveedor,
  cliente,
  conductor,
  proceso,
  usuario,
} from "@perunor/db";
import { CrearDocumentoSchema, ActualizarDocumentoSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

type Tipo = "compra" | "procesamiento" | "salida" | "factura";
type Estado = "borrador" | "confirmado" | "anulado";

const IGV_RATE = 0.18;

function calcularTotales(lineas: Array<{ cantidad: string; precioUnitario?: string; movimiento: "ingreso" | "egreso" }>) {
  let subtotal = 0;
  const lineasConSubtotal = lineas.map((l) => {
    const cant = Number(l.cantidad);
    const precio = Number(l.precioUnitario ?? "0");
    const sub = cant * precio;
    subtotal += sub;
    return { ...l, subtotalNum: sub };
  });
  const igv = +(subtotal * IGV_RATE).toFixed(4);
  const total = +(subtotal + igv).toFixed(4);
  return {
    subtotal: subtotal.toFixed(4),
    igv: igv.toFixed(4),
    total: total.toFixed(4),
    lineasConSubtotal,
  };
}

async function asignarNumero(tx: any, tipo: Tipo, fecha: string): Promise<string> {
  const anio = Number(fecha.slice(0, 4));
  const [row] = await tx
    .insert(contadorDocumento)
    .values({ tipo, anio, ultimoNumero: 1 })
    .onConflictDoUpdate({
      target: [contadorDocumento.tipo, contadorDocumento.anio],
      set: { ultimoNumero: sql`${contadorDocumento.ultimoNumero} + 1` },
    })
    .returning({ n: contadorDocumento.ultimoNumero });
  const prefijo = { compra: "C", procesamiento: "P", salida: "S", factura: "F" }[tipo];
  return `${prefijo}-${anio}-${String(row.n).padStart(6, "0")}`;
}

export const documentoResolvers = {
  Query: {
    documentos: async (
      _: unknown,
      {
        page = 1,
        limit = 10,
        tipo,
        estado,
        search,
      }: { page?: number; limit?: number; tipo?: Tipo; estado?: Estado; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const conditions = [
        tipo ? eq(documento.tipo, tipo) : undefined,
        estado ? eq(documento.estado, estado) : undefined,
        search ? ilike(documento.numero, `%${search}%`) : undefined,
      ].filter(Boolean) as any[];
      const whereClause = conditions.length ? and(...conditions) : undefined;

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(documento)
          .where(whereClause)
          .orderBy(desc(documento.fecha), desc(documento.creadoEn))
          .limit(safeLimit)
          .offset(offset),
        db.select({ total: count() }).from(documento).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    documento: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(documento).where(eq(documento.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearDocumento: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearDocumentoSchema.parse(input);
      const { subtotal, igv, total, lineasConSubtotal } = calcularTotales(data.lineas);

      return await db.transaction(async (tx) => {
        const [nuevo] = await tx
          .insert(documento)
          .values({
            tipo: data.tipo,
            fecha: data.fecha,
            estado: "borrador",
            observaciones: data.observaciones ?? null,
            proveedorId: data.proveedorId ?? null,
            clienteId: data.clienteId ?? null,
            almacenId: data.almacenId,
            almacenDestinoId: data.almacenDestinoId ?? null,
            conductorId: data.conductorId ?? null,
            procesoId: data.procesoId ?? null,
            usuarioId,
            subtotal,
            igv,
            total,
          })
          .returning();

        await tx.insert(documentoLinea).values(
          lineasConSubtotal.map((l, idx) => ({
            documentoId: nuevo.id,
            articuloId: l.articuloId,
            procesoId: l.procesoId ?? null,
            orden: idx,
            movimiento: l.movimiento,
            cantidad: l.cantidad,
            unidad: l.unidad,
            precioUnitario: l.precioUnitario ?? "0",
            subtotal: l.subtotalNum.toFixed(4),
          })),
        );

        return nuevo;
      });
    },

    actualizarDocumento: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarDocumentoSchema.parse(input);

      return await db.transaction(async (tx) => {
        const [actual] = await tx.select().from(documento).where(eq(documento.id, id)).limit(1);
        if (!actual) throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } });
        if (actual.estado !== "borrador") {
          throw new GraphQLError("Solo se pueden editar documentos en borrador", {
            extensions: { code: "INVALID_STATE" },
          });
        }

        let totales: { subtotal: string; igv: string; total: string } | null = null;
        if (data.lineas) {
          const r = calcularTotales(data.lineas);
          totales = { subtotal: r.subtotal, igv: r.igv, total: r.total };
          await tx.delete(documentoLinea).where(eq(documentoLinea.documentoId, id));
          await tx.insert(documentoLinea).values(
            r.lineasConSubtotal.map((l, idx) => ({
              documentoId: id,
              articuloId: l.articuloId,
              procesoId: l.procesoId ?? null,
              orden: idx,
              movimiento: l.movimiento,
              cantidad: l.cantidad,
              unidad: l.unidad,
              precioUnitario: l.precioUnitario ?? "0",
              subtotal: l.subtotalNum.toFixed(4),
            })),
          );
        }

        const [actualizado] = await tx
          .update(documento)
          .set({
            ...(data.fecha !== undefined && { fecha: data.fecha }),
            ...(data.observaciones !== undefined && { observaciones: data.observaciones ?? null }),
            ...(data.proveedorId !== undefined && { proveedorId: data.proveedorId ?? null }),
            ...(data.clienteId !== undefined && { clienteId: data.clienteId ?? null }),
            ...(data.almacenId !== undefined && { almacenId: data.almacenId }),
            ...(data.almacenDestinoId !== undefined && { almacenDestinoId: data.almacenDestinoId ?? null }),
            ...(data.conductorId !== undefined && { conductorId: data.conductorId ?? null }),
            ...(data.procesoId !== undefined && { procesoId: data.procesoId ?? null }),
            ...(totales && totales),
            actualizadoEn: new Date(),
          })
          .where(eq(documento.id, id))
          .returning();

        return actualizado;
      });
    },

    confirmarDocumento: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      return await db.transaction(async (tx) => {
        const [actual] = await tx.select().from(documento).where(eq(documento.id, id)).limit(1);
        if (!actual) throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } });
        if (actual.estado !== "borrador") {
          throw new GraphQLError("Solo se confirman borradores", { extensions: { code: "INVALID_STATE" } });
        }

        const lineas = await tx.select().from(documentoLinea).where(eq(documentoLinea.documentoId, id));
        if (lineas.length === 0) {
          throw new GraphQLError("El documento no tiene líneas", { extensions: { code: "INVALID_STATE" } });
        }

        const numero = actual.numero ?? (await asignarNumero(tx, actual.tipo, actual.fecha));

        const [actualizado] = await tx
          .update(documento)
          .set({
            estado: "confirmado",
            numero,
            confirmadoEn: new Date(),
            actualizadoEn: new Date(),
          })
          .where(eq(documento.id, id))
          .returning();

        await tx.insert(outboxEvento).values({
          tipo: "documento.confirmado",
          entidad: "documento",
          entidadId: id,
          payload: {
            documentoId: id,
            tipo: actual.tipo,
            numero,
            fecha: actual.fecha,
            almacenId: actual.almacenId,
            almacenDestinoId: actual.almacenDestinoId,
            lineas: lineas.map((l) => ({
              articuloId: l.articuloId,
              movimiento: l.movimiento,
              cantidad: l.cantidad,
              unidad: l.unidad,
              precioUnitario: l.precioUnitario,
            })),
          },
        });

        return actualizado;
      });
    },

    anularDocumento: async (
      _: unknown,
      { id, motivo }: { id: string; motivo?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      return await db.transaction(async (tx) => {
        const [actual] = await tx.select().from(documento).where(eq(documento.id, id)).limit(1);
        if (!actual) throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } });
        if (actual.estado === "anulado") {
          throw new GraphQLError("Documento ya anulado", { extensions: { code: "INVALID_STATE" } });
        }

        const [actualizado] = await tx
          .update(documento)
          .set({
            estado: "anulado",
            anuladoEn: new Date(),
            actualizadoEn: new Date(),
            observaciones: motivo
              ? `${actual.observaciones ? actual.observaciones + "\n" : ""}[Anulado] ${motivo}`
              : actual.observaciones,
          })
          .where(eq(documento.id, id))
          .returning();

        if (actual.estado === "confirmado") {
          await tx.insert(outboxEvento).values({
            tipo: "documento.anulado",
            entidad: "documento",
            entidadId: id,
            payload: { documentoId: id, tipo: actual.tipo, numero: actual.numero, motivo: motivo ?? null },
          });
        }

        return actualizado;
      });
    },

    eliminarDocumento: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const [actual] = await db.select().from(documento).where(eq(documento.id, id)).limit(1);
      if (!actual) throw new GraphQLError("Documento no encontrado", { extensions: { code: "NOT_FOUND" } });
      if (actual.estado !== "borrador") {
        throw new GraphQLError("Solo se pueden eliminar borradores", { extensions: { code: "INVALID_STATE" } });
      }

      await db.delete(documento).where(eq(documento.id, id));
      return true;
    },
  },

  Documento: {
    lineas: async ({ id }: { id: string }, _: unknown, { db }: ApolloContext) => {
      return db.select().from(documentoLinea).where(eq(documentoLinea.documentoId, id));
    },
    proveedor: async (doc: any, _: unknown, { db }: ApolloContext) =>
      doc.proveedorId ? (await db.select().from(proveedor).where(eq(proveedor.id, doc.proveedorId)).limit(1))[0] ?? null : null,
    cliente: async (doc: any, _: unknown, { db }: ApolloContext) =>
      doc.clienteId ? (await db.select().from(cliente).where(eq(cliente.id, doc.clienteId)).limit(1))[0] ?? null : null,
    almacen: async (doc: any, _: unknown, { db }: ApolloContext) =>
      (await db.select().from(almacen).where(eq(almacen.id, doc.almacenId)).limit(1))[0] ?? null,
    almacenDestino: async (doc: any, _: unknown, { db }: ApolloContext) =>
      doc.almacenDestinoId
        ? (await db.select().from(almacen).where(eq(almacen.id, doc.almacenDestinoId)).limit(1))[0] ?? null
        : null,
    conductor: async (doc: any, _: unknown, { db }: ApolloContext) =>
      doc.conductorId ? (await db.select().from(conductor).where(eq(conductor.id, doc.conductorId)).limit(1))[0] ?? null : null,
    proceso: async (doc: any, _: unknown, { db }: ApolloContext) =>
      doc.procesoId ? (await db.select().from(proceso).where(eq(proceso.id, doc.procesoId)).limit(1))[0] ?? null : null,
    usuario: async (doc: any, _: unknown, { db }: ApolloContext) => {
      const u = (await db.select().from(usuario).where(eq(usuario.id, doc.usuarioId)).limit(1))[0];
      return u ? { ...u, activo: u.activo === "1" } : null;
    },
  },

  DocumentoLinea: {
    articulo: async (line: any, _: unknown, { db }: ApolloContext) =>
      (await db.select().from(articulo).where(eq(articulo.id, line.articuloId)).limit(1))[0] ?? null,
    proceso: async (line: any, _: unknown, { db }: ApolloContext) =>
      line.procesoId ? (await db.select().from(proceso).where(eq(proceso.id, line.procesoId)).limit(1))[0] ?? null : null,
  },
};
