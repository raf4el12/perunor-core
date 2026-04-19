import { z } from "zod";

export const CrearProveedorSchema = z.object({
  ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  contacto: z.string().max(200).optional(),
});

export const ActualizarProveedorSchema = CrearProveedorSchema.partial();

export type CrearProveedorInput = z.infer<typeof CrearProveedorSchema>;
export type ActualizarProveedorInput = z.infer<typeof ActualizarProveedorSchema>;
