import { z } from "zod";

export const RolEnum = z.enum(["admin", "operador"]);

export const CrearUsuarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(120),
  email: z.string().email("Email inválido").max(255).transform((v) => v.toLowerCase()),
  rol: RolEnum,
});

export const ActualizarUsuarioSchema = CrearUsuarioSchema.partial();

export type CrearUsuarioInput = z.infer<typeof CrearUsuarioSchema>;
export type ActualizarUsuarioInput = z.infer<typeof ActualizarUsuarioSchema>;
