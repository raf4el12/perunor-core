import { z } from "zod";

export const CrearClienteSchema = z.object({
  ruc: z.string().regex(/^\d{11}$/, "El RUC debe tener 11 dígitos"),
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  contacto: z.string().max(200).optional(),
});

export const ActualizarClienteSchema = CrearClienteSchema.partial();

export type CrearClienteInput = z.infer<typeof CrearClienteSchema>;
export type ActualizarClienteInput = z.infer<typeof ActualizarClienteSchema>;
