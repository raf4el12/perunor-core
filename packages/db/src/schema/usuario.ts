import { pgTable, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const rolEnum = pgEnum("rol", ["admin", "operador"]);

export const usuario = pgTable("usuario", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: varchar("nombre", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  rol: rolEnum("rol").notNull().default("operador"),
  activo: varchar("activo", { length: 1 }).notNull().default("1"),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});

export const otpCode = pgTable("otp_code", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiraEn: timestamp("expira_en").notNull(),
  usado: varchar("usado", { length: 1 }).notNull().default("0"),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});
