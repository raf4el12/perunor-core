import { z } from "zod";

export const CrearProcesoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  descripcion: z.string().optional(),
});

export const ActualizarProcesoSchema = CrearProcesoSchema.partial();

export type CrearProcesoInput = z.infer<typeof CrearProcesoSchema>;
export type ActualizarProcesoInput = z.infer<typeof ActualizarProcesoSchema>;
