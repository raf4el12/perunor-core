import { pgTable, uuid, varchar, jsonb, timestamp, integer, text, index } from "drizzle-orm/pg-core";

export const outboxEvento = pgTable(
  "outbox_evento",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tipo: varchar("tipo", { length: 60 }).notNull(),
    entidad: varchar("entidad", { length: 40 }).notNull(),
    entidadId: uuid("entidad_id").notNull(),
    payload: jsonb("payload").notNull(),

    creadoEn: timestamp("creado_en").notNull().defaultNow(),
    procesadoEn: timestamp("procesado_en"),
    intentos: integer("intentos").notNull().default(0),
    ultimoError: text("ultimo_error"),
  },
  (t) => ({
    pendienteIdx: index("outbox_pendiente_idx").on(t.procesadoEn, t.creadoEn),
  }),
);
