import { eq, ilike, count, asc } from "drizzle-orm";
import { almacen } from "@perunor/db";
import { CrearAlmacenSchema, ActualizarAlmacenSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const almacenResolvers = {
  Query: {
    almacenes: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search ? ilike(almacen.nombre, `%${search}%`) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(almacen).where(whereClause).orderBy(asc(almacen.nombre)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(almacen).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    almacen: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(almacen).where(eq(almacen.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearAlmacen: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearAlmacenSchema.parse(input);

      const [nuevo] = await db
        .insert(almacen)
        .values({
          nombre: data.nombre,
          ubicacion: data.ubicacion || null,
        })
        .returning();

      return nuevo;
    },

    actualizarAlmacen: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarAlmacenSchema.parse(input);

      const [actualizado] = await db
        .update(almacen)
        .set({
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.ubicacion !== undefined && { ubicacion: data.ubicacion || null }),
          actualizadoEn: new Date(),
        })
        .where(eq(almacen.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Almacén no encontrado", { extensions: { code: "NOT_FOUND" } });
      return actualizado;
    },

    toggleAlmacen: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const existing = await db.select().from(almacen).where(eq(almacen.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Almacén no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(almacen)
        .set({ activo: !existing[0].activo, actualizadoEn: new Date() })
        .where(eq(almacen.id, id))
        .returning();

      return actualizado;
    },
  },
};
