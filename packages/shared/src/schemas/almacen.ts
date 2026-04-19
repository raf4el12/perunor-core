import { z } from "zod";

export const CrearAlmacenSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  ubicacion: z.string().optional(),
});

export const ActualizarAlmacenSchema = CrearAlmacenSchema.partial();

export type CrearAlmacenInput = z.infer<typeof CrearAlmacenSchema>;
export type ActualizarAlmacenInput = z.infer<typeof ActualizarAlmacenSchema>;
