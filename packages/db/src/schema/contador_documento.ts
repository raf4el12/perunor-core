import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { tipoDocumentoEnum } from "./documento";

export const contadorDocumento = pgTable(
  "contador_documento",
  {
    tipo: tipoDocumentoEnum("tipo").notNull(),
    anio: integer("anio").notNull(),
    ultimoNumero: integer("ultimo_numero").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tipo, t.anio] }),
  }),
);
