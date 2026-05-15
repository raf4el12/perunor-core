import { z } from "zod";

export const TipoDocumentoEnum = z.enum([
  "compra",
  "procesamiento",
  "salida",
  "factura",
]);

export const EstadoDocumentoEnum = z.enum([
  "borrador",
  "confirmado",
  "anulado",
]);

export const MovimientoLineaEnum = z.enum(["ingreso", "egreso"]);

export const TipoCierreEnum = z.enum(["auto_recepcion", "manual"]);

const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Número decimal inválido");

const fechaISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)");

export const CrearDocumentoLineaSchema = z.object({
  articuloId: z.string().uuid(),
  procesoId: z.string().uuid().optional().nullable(),
  movimiento: MovimientoLineaEnum,
  cantidad: decimalString,
  unidad: z.string().min(1).max(12),
  precioUnitario: decimalString.optional(),
  // Planificación (procesamiento)
  cantidadEstimada: decimalString.optional().nullable(),
  lote: z.string().max(50).optional().nullable(),
  porcentaje: decimalString.optional().nullable(),
  esMateriaInsumo: z.boolean().optional().nullable(),
});

export const CrearDocumentoSchema = z.object({
  tipo: TipoDocumentoEnum,
  fecha: fechaISO,
  observaciones: z.string().optional().nullable(),

  proveedorId: z.string().uuid().optional().nullable(),
  clienteId: z.string().uuid().optional().nullable(),
  almacenId: z.string().uuid(),
  almacenDestinoId: z.string().uuid().optional().nullable(),
  conductorId: z.string().uuid().optional().nullable(),
  procesoId: z.string().uuid().optional().nullable(),

  // Planificación (procesamiento)
  tipoCierre: TipoCierreEnum.optional().nullable(),
  tipoMotivo: z.string().max(100).optional().nullable(),
  fechaInicioPlan: fechaISO.optional().nullable(),
  fechaTerminoPlan: fechaISO.optional().nullable(),

  lineas: z.array(CrearDocumentoLineaSchema).min(1, "Al menos una línea"),
}).superRefine((data, ctx) => {
  if (data.tipo === "compra" && !data.proveedorId) {
    ctx.addIssue({ code: "custom", path: ["proveedorId"], message: "Proveedor requerido para compra" });
  }
  if ((data.tipo === "salida" || data.tipo === "factura") && !data.clienteId) {
    ctx.addIssue({ code: "custom", path: ["clienteId"], message: "Cliente requerido" });
  }
  if (data.tipo === "procesamiento") {
    if (!data.almacenDestinoId) {
      ctx.addIssue({ code: "custom", path: ["almacenDestinoId"], message: "Almacén destino requerido" });
    }
    if (!data.procesoId) {
      ctx.addIssue({ code: "custom", path: ["procesoId"], message: "Proceso requerido" });
    }
  }
});

export const ActualizarDocumentoSchema = z.object({
  fecha: fechaISO.optional(),
  observaciones: z.string().optional().nullable(),
  proveedorId: z.string().uuid().optional().nullable(),
  clienteId: z.string().uuid().optional().nullable(),
  almacenId: z.string().uuid().optional(),
  almacenDestinoId: z.string().uuid().optional().nullable(),
  conductorId: z.string().uuid().optional().nullable(),
  procesoId: z.string().uuid().optional().nullable(),
  tipoCierre: TipoCierreEnum.optional().nullable(),
  tipoMotivo: z.string().max(100).optional().nullable(),
  fechaInicioPlan: fechaISO.optional().nullable(),
  fechaTerminoPlan: fechaISO.optional().nullable(),
  lineas: z.array(CrearDocumentoLineaSchema).min(1).optional(),
});

export const CrearOrdenEjecucionSchema = z.object({
  fechaInicio: z.string().datetime({ message: "Timestamp inválido (ISO 8601)" }),
  fechaTermino: z.string().datetime({ message: "Timestamp inválido (ISO 8601)" }),
  nroTrabajadores: z.number().int().positive().optional().nullable(),
  supervisor: z.string().max(150).optional().nullable(),
}).refine((d) => new Date(d.fechaTermino) > new Date(d.fechaInicio), {
  message: "fechaTermino debe ser posterior a fechaInicio",
  path: ["fechaTermino"],
});

export type CrearDocumentoInput = z.infer<typeof CrearDocumentoSchema>;
export type ActualizarDocumentoInput = z.infer<typeof ActualizarDocumentoSchema>;
export type CrearDocumentoLineaInput = z.infer<typeof CrearDocumentoLineaSchema>;
export type CrearOrdenEjecucionInput = z.infer<typeof CrearOrdenEjecucionSchema>;
