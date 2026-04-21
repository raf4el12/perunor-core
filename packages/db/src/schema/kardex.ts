import { pgTable, uuid, numeric, timestamp, index, varchar } from "drizzle-orm/pg-core";
import { articulo } from "./articulo";
import { almacen } from "./almacen";
import { documento } from "./documento";
import { documentoLinea } from "./documento_linea";
import { movimientoLineaEnum } from "./documento_linea";

export const kardexMovimiento = pgTable(
  "kardex_movimiento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    articuloId: uuid("articulo_id").notNull().references(() => articulo.id),
    almacenId: uuid("almacen_id").notNull().references(() => almacen.id),

    fecha: timestamp("fecha").notNull().defaultNow(),
    movimiento: movimientoLineaEnum("movimiento").notNull(),

    cantidad: numeric("cantidad", { precision: 14, scale: 4 }).notNull(),
    costoUnitario: numeric("costo_unitario", { precision: 14, scale: 4 }).notNull(),
    costoTotal: numeric("costo_total", { precision: 14, scale: 4 }).notNull(),

    saldoCantidad: numeric("saldo_cantidad", { precision: 14, scale: 4 }).notNull(),
    saldoCosto: numeric("saldo_costo", { precision: 14, scale: 4 }).notNull(),
    saldoCostoUnitario: numeric("saldo_costo_unitario", { precision: 14, scale: 4 }).notNull(),

    documentoId: uuid("documento_id").references(() => documento.id),
    documentoLineaId: uuid("documento_linea_id").references(() => documentoLinea.id),
    referencia: varchar("referencia", { length: 60 }),

    creadoEn: timestamp("creado_en").notNull().defaultNow(),
  },
  (t) => ({
    saldoIdx: index("kardex_saldo_idx").on(t.articuloId, t.almacenId, t.creadoEn),
    documentoIdx: index("kardex_documento_idx").on(t.documentoId),
  }),
);
