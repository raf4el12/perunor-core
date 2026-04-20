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

const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?$/, "Número decimal inválido");

export const CrearDocumentoLineaSchema = z.object({
  articuloId: z.string().uuid(),
  procesoId: z.string().uuid().optional().nullable(),
  movimiento: MovimientoLineaEnum,
  cantidad: decimalString,
  unidad: z.string().min(1).max(12),
  precioUnitario: decimalString.optional(),
});

export const CrearDocumentoSchema = z.object({
  tipo: TipoDocumentoEnum,
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  observaciones: z.string().optional().nullable(),

  proveedorId: z.string().uuid().optional().nullable(),
  clienteId: z.string().uuid().optional().nullable(),
  almacenId: z.string().uuid(),
  almacenDestinoId: z.string().uuid().optional().nullable(),
  conductorId: z.string().uuid().optional().nullable(),
  procesoId: z.string().uuid().optional().nullable(),

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
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  observaciones: z.string().optional().nullable(),
  proveedorId: z.string().uuid().optional().nullable(),
  clienteId: z.string().uuid().optional().nullable(),
  almacenId: z.string().uuid().optional(),
  almacenDestinoId: z.string().uuid().optional().nullable(),
  conductorId: z.string().uuid().optional().nullable(),
  procesoId: z.string().uuid().optional().nullable(),
  lineas: z.array(CrearDocumentoLineaSchema).min(1).optional(),
});

export type CrearDocumentoInput = z.infer<typeof CrearDocumentoSchema>;
export type ActualizarDocumentoInput = z.infer<typeof ActualizarDocumentoSchema>;
export type CrearDocumentoLineaInput = z.infer<typeof CrearDocumentoLineaSchema>;
