import { pgTable, uuid, numeric, varchar, integer, pgEnum, boolean } from "drizzle-orm/pg-core";
import { documento } from "./documento";
import { articulo } from "./articulo";
import { proceso } from "./proceso";

export const movimientoLineaEnum = pgEnum("movimiento_linea", [
  "ingreso",
  "egreso",
]);

export const documentoLinea = pgTable("documento_linea", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentoId: uuid("documento_id")
    .notNull()
    .references(() => documento.id, { onDelete: "cascade" }),
  articuloId: uuid("articulo_id").notNull().references(() => articulo.id),
  procesoId: uuid("proceso_id").references(() => proceso.id),

  orden: integer("orden").notNull().default(0),
  movimiento: movimientoLineaEnum("movimiento").notNull(),
  cantidad: numeric("cantidad", { precision: 14, scale: 4 }).notNull(),
  unidad: varchar("unidad", { length: 12 }).notNull(),
  precioUnitario: numeric("precio_unitario", { precision: 14, scale: 4 }).notNull().default("0"),
  subtotal: numeric("subtotal", { precision: 14, scale: 4 }).notNull().default("0"),

  // Campos de planificación (procesamiento / OrdenTrabajo)
  cantidadEstimada: numeric("cantidad_estimada", { precision: 14, scale: 4 }),
  lote: varchar("lote", { length: 50 }),
  porcentaje: numeric("porcentaje", { precision: 7, scale: 4 }),
  esMateriaInsumo: boolean("es_materia_insumo"),
});
