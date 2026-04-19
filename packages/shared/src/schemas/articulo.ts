import { z } from "zod";

export const CategoriaArticuloEnum = z.enum([
  "materia_prima",
  "insumo",
  "producto_terminado",
  "empaque",
]);

export const CrearArticuloSchema = z.object({
  codigo: z.string().min(1, "El código es requerido").max(50),
  nombre: z.string().min(1, "El nombre es requerido").max(200),
  descripcion: z.string().optional(),
  unidadMedida: z.string().min(1, "La unidad de medida es requerida").max(20),
  categoria: CategoriaArticuloEnum,
});

export const ActualizarArticuloSchema = CrearArticuloSchema.partial();

export type CrearArticuloInput = z.infer<typeof CrearArticuloSchema>;
export type ActualizarArticuloInput = z.infer<typeof ActualizarArticuloSchema>;
