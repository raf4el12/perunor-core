import { eq, ilike, or, count, asc } from "drizzle-orm";
import { proveedor } from "@perunor/db";
import { CrearProveedorSchema, ActualizarProveedorSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const proveedorResolvers = {
  Query: {
    proveedores: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search
        ? or(ilike(proveedor.nombre, `%${search}%`), ilike(proveedor.ruc, `%${search}%`))
        : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(proveedor).where(whereClause).orderBy(asc(proveedor.nombre)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(proveedor).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    proveedor: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(proveedor).where(eq(proveedor.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearProveedor: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearProveedorSchema.parse(input);

      const [nuevo] = await db
        .insert(proveedor)
        .values({
          ruc: data.ruc,
          nombre: data.nombre,
          contacto: data.contacto || null,
        })
        .returning();

      return nuevo;
    },

    actualizarProveedor: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarProveedorSchema.parse(input);

      const [actualizado] = await db
        .update(proveedor)
        .set({
          ...(data.ruc !== undefined && { ruc: data.ruc }),
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.contacto !== undefined && { contacto: data.contacto || null }),
          actualizadoEn: new Date(),
        })
        .where(eq(proveedor.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Proveedor no encontrado", { extensions: { code: "NOT_FOUND" } });
      return actualizado;
    },

    toggleProveedor: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const existing = await db.select().from(proveedor).where(eq(proveedor.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Proveedor no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(proveedor)
        .set({ activo: !existing[0].activo, actualizadoEn: new Date() })
        .where(eq(proveedor.id, id))
        .returning();

      return actualizado;
    },
  },
};
