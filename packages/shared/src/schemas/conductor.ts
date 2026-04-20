import { z } from "zod";

export const CrearConductorSchema = z.object({
  dni: z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos"),
  nombres: z.string().min(1, "Los nombres son requeridos").max(100),
  apellidos: z.string().min(1, "Los apellidos son requeridos").max(100),
  licencia: z.string().max(20).optional(),
  telefono: z.string().max(20).optional(),
  placaVehiculo: z.string().max(10).optional(),
});

export const ActualizarConductorSchema = CrearConductorSchema.partial();

export type CrearConductorInput = z.infer<typeof CrearConductorSchema>;
export type ActualizarConductorInput = z.infer<typeof ActualizarConductorSchema>;
