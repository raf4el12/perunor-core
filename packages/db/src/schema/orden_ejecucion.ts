import { pgTable, uuid, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { documento } from "./documento";

export const ordenEjecucion = pgTable("orden_ejecucion", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentoId: uuid("documento_id")
    .notNull()
    .references(() => documento.id, { onDelete: "cascade" }),
  fechaInicio: timestamp("fecha_inicio").notNull(),
  fechaTermino: timestamp("fecha_termino").notNull(),
  nroTrabajadores: integer("nro_trabajadores"),
  supervisor: varchar("supervisor", { length: 150 }),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
});
