import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const categoriaArticuloEnum = pgEnum("categoria_articulo", [
  "materia_prima",
  "insumo",
  "producto_terminado",
  "empaque",
]);

export const articulo = pgTable("articulo", {
  id: uuid("id").primaryKey().defaultRandom(),
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  nombre: varchar("nombre", { length: 200 }).notNull(),
  descripcion: text("descripcion"),
  unidadMedida: varchar("unidad_medida", { length: 20 }).notNull(),
  categoria: categoriaArticuloEnum("categoria").notNull(),
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});
