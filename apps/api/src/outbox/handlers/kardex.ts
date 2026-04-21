import { and, asc, desc, eq } from "drizzle-orm";
import {
  documento,
  documentoLinea,
  kardexMovimiento,
} from "@perunor/db";

type Movimiento = "ingreso" | "egreso";
type TipoDocumento = "compra" | "procesamiento" | "salida" | "factura";

function toNum(s: string | number | null | undefined): number {
  if (s == null) return 0;
  return typeof s === "number" ? s : Number(s);
}

function fmt(n: number): string {
  return n.toFixed(4);
}

function almacenDeLinea(
  tipo: TipoDocumento,
  movimiento: Movimiento,
  almacenId: string,
  almacenDestinoId: string | null,
): string {
  if (tipo === "procesamiento" && movimiento === "ingreso") {
    if (!almacenDestinoId) throw new Error("procesamiento sin almacenDestinoId");
    return almacenDestinoId;
  }
  return almacenId;
}

async function saldoActual(tx: any, articuloId: string, almacenId: string) {
  const [ultimo] = await tx
    .select()
    .from(kardexMovimiento)
    .where(and(eq(kardexMovimiento.articuloId, articuloId), eq(kardexMovimiento.almacenId, almacenId)))
    .orderBy(desc(kardexMovimiento.creadoEn))
    .limit(1);

  return {
    cantidad: toNum(ultimo?.saldoCantidad),
    costo: toNum(ultimo?.saldoCosto),
    costoUnitario: toNum(ultimo?.saldoCostoUnitario),
  };
}

function aplicarMovimiento(
  saldoPrev: { cantidad: number; costo: number; costoUnitario: number },
  movimiento: Movimiento,
  cantidad: number,
  costoUnitarioIngreso: number,
) {
  if (movimiento === "ingreso") {
    const nuevaCant = saldoPrev.cantidad + cantidad;
    const nuevoCosto = saldoPrev.costo + cantidad * costoUnitarioIngreso;
    const nuevoUnit = nuevaCant > 0 ? nuevoCosto / nuevaCant : 0;
    return {
      costoUnitarioMov: costoUnitarioIngreso,
      costoTotalMov: cantidad * costoUnitarioIngreso,
      saldo: { cantidad: nuevaCant, costo: nuevoCosto, costoUnitario: nuevoUnit },
    };
  }
  const costoUnit = saldoPrev.costoUnitario;
  const costoTotalEgreso = cantidad * costoUnit;
  const nuevaCant = saldoPrev.cantidad - cantidad;
  const nuevoCosto = saldoPrev.costo - costoTotalEgreso;
  const nuevoUnit = nuevaCant > 0 ? nuevoCosto / nuevaCant : costoUnit;
  return {
    costoUnitarioMov: costoUnit,
    costoTotalMov: costoTotalEgreso,
    saldo: { cantidad: nuevaCant, costo: nuevoCosto, costoUnitario: nuevoUnit },
  };
}

export async function procesarConfirmacion(tx: any, documentoId: string) {
  const [doc] = await tx.select().from(documento).where(eq(documento.id, documentoId)).limit(1);
  if (!doc) throw new Error(`Documento ${documentoId} no encontrado`);
  if (doc.estado !== "confirmado") throw new Error(`Documento ${documentoId} no está confirmado`);

  const yaProcesado = await tx
    .select({ id: kardexMovimiento.id })
    .from(kardexMovimiento)
    .where(and(eq(kardexMovimiento.documentoId, documentoId), eq(kardexMovimiento.referencia, doc.numero ?? "")))
    .limit(1);
  if (yaProcesado.length > 0) return { procesadas: 0, idempotente: true };

  const lineas = await tx
    .select()
    .from(documentoLinea)
    .where(eq(documentoLinea.documentoId, documentoId))
    .orderBy(asc(documentoLinea.orden));

  let insertadas = 0;
  for (const linea of lineas) {
    const almacenLinea = almacenDeLinea(
      doc.tipo as TipoDocumento,
      linea.movimiento as Movimiento,
      doc.almacenId,
      doc.almacenDestinoId,
    );
    const cantidad = toNum(linea.cantidad);
    const costoUnit = toNum(linea.precioUnitario);

    const prev = await saldoActual(tx, linea.articuloId, almacenLinea);
    const mov = aplicarMovimiento(prev, linea.movimiento as Movimiento, cantidad, costoUnit);

    await tx.insert(kardexMovimiento).values({
      articuloId: linea.articuloId,
      almacenId: almacenLinea,
      fecha: new Date(`${doc.fecha}T00:00:00Z`),
      movimiento: linea.movimiento,
      cantidad: fmt(cantidad),
      costoUnitario: fmt(mov.costoUnitarioMov),
      costoTotal: fmt(mov.costoTotalMov),
      saldoCantidad: fmt(mov.saldo.cantidad),
      saldoCosto: fmt(mov.saldo.costo),
      saldoCostoUnitario: fmt(mov.saldo.costoUnitario),
      documentoId: doc.id,
      documentoLineaId: linea.id,
      referencia: doc.numero ?? null,
    });
    insertadas++;
  }

  return { procesadas: insertadas, idempotente: false };
}

export async function procesarAnulacion(tx: any, documentoId: string) {
  const [doc] = await tx.select().from(documento).where(eq(documento.id, documentoId)).limit(1);
  if (!doc) throw new Error(`Documento ${documentoId} no encontrado`);

  const refAnula = `ANULA-${doc.numero ?? documentoId}`;

  const yaReversado = await tx
    .select({ id: kardexMovimiento.id })
    .from(kardexMovimiento)
    .where(and(eq(kardexMovimiento.documentoId, documentoId), eq(kardexMovimiento.referencia, refAnula)))
    .limit(1);
  if (yaReversado.length > 0) return { procesadas: 0, idempotente: true };

  const originales = await tx
    .select()
    .from(kardexMovimiento)
    .where(and(eq(kardexMovimiento.documentoId, documentoId), eq(kardexMovimiento.referencia, doc.numero ?? "")))
    .orderBy(asc(kardexMovimiento.creadoEn));

  let insertadas = 0;
  for (const o of originales) {
    const movInverso: Movimiento = o.movimiento === "ingreso" ? "egreso" : "ingreso";
    const cantidad = toNum(o.cantidad);
    const costoOriginal = toNum(o.costoUnitario);

    const prev = await saldoActual(tx, o.articuloId, o.almacenId);
    const mov = aplicarMovimiento(prev, movInverso, cantidad, costoOriginal);

    await tx.insert(kardexMovimiento).values({
      articuloId: o.articuloId,
      almacenId: o.almacenId,
      fecha: new Date(),
      movimiento: movInverso,
      cantidad: fmt(cantidad),
      costoUnitario: fmt(mov.costoUnitarioMov),
      costoTotal: fmt(mov.costoTotalMov),
      saldoCantidad: fmt(mov.saldo.cantidad),
      saldoCosto: fmt(mov.saldo.costo),
      saldoCostoUnitario: fmt(mov.saldo.costoUnitario),
      documentoId: doc.id,
      documentoLineaId: o.documentoLineaId,
      referencia: refAnula,
    });
    insertadas++;
  }

  return { procesadas: insertadas, idempotente: false };
}
