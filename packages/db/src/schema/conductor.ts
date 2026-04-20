import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const conductor = pgTable("conductor", {
  id: uuid("id").primaryKey().defaultRandom(),
  dni: varchar("dni", { length: 8 }).notNull().unique(),
  nombres: varchar("nombres", { length: 100 }).notNull(),
  apellidos: varchar("apellidos", { length: 100 }).notNull(),
  licencia: varchar("licencia", { length: 20 }),
  telefono: varchar("telefono", { length: 20 }),
  placaVehiculo: varchar("placa_vehiculo", { length: 10 }),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});
