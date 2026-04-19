import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";

export const cliente = pgTable("cliente", {
  id: uuid("id").primaryKey().defaultRandom(),
  ruc: varchar("ruc", { length: 11 }).notNull().unique(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  contacto: varchar("contacto", { length: 200 }),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});
