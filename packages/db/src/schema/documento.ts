import { pgTable, uuid, varchar, text, numeric, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { proveedor } from "./proveedor";
import { cliente } from "./cliente";
import { almacen } from "./almacen";
import { conductor } from "./conductor";
import { proceso } from "./proceso";
import { usuario } from "./usuario";

export const tipoDocumentoEnum = pgEnum("tipo_documento", [
  "compra",
  "procesamiento",
  "salida",
  "factura",
]);

export const estadoDocumentoEnum = pgEnum("estado_documento", [
  "borrador",
  "confirmado",
  "anulado",
]);

export const documento = pgTable("documento", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: tipoDocumentoEnum("tipo").notNull(),
  numero: varchar("numero", { length: 30 }),
  fecha: date("fecha").notNull(),
  estado: estadoDocumentoEnum("estado").notNull().default("borrador"),
  observaciones: text("observaciones"),

  proveedorId: uuid("proveedor_id").references(() => proveedor.id),
  clienteId: uuid("cliente_id").references(() => cliente.id),
  almacenId: uuid("almacen_id").notNull().references(() => almacen.id),
  almacenDestinoId: uuid("almacen_destino_id").references(() => almacen.id),
  conductorId: uuid("conductor_id").references(() => conductor.id),
  procesoId: uuid("proceso_id").references(() => proceso.id),
  usuarioId: uuid("usuario_id").notNull().references(() => usuario.id),

  subtotal: numeric("subtotal", { precision: 14, scale: 4 }).notNull().default("0"),
  igv: numeric("igv", { precision: 14, scale: 4 }).notNull().default("0"),
  total: numeric("total", { precision: 14, scale: 4 }).notNull().default("0"),

  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
  confirmadoEn: timestamp("confirmado_en"),
  anuladoEn: timestamp("anulado_en"),
});
