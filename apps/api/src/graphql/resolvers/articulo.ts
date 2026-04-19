import { eq, ilike, or, count, asc } from "drizzle-orm";
import { articulo } from "@perunor/db";
import { CrearArticuloSchema, ActualizarArticuloSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const articuloResolvers = {
  Query: {
    articulos: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search
        ? or(ilike(articulo.nombre, `%${search}%`), ilike(articulo.codigo, `%${search}%`))
        : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(articulo).where(whereClause).orderBy(asc(articulo.nombre)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(articulo).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    articulo: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(articulo).where(eq(articulo.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearArticulo: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearArticuloSchema.parse(input);

      const [nuevo] = await db
        .insert(articulo)
        .values({
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion || null,
          unidadMedida: data.unidadMedida,
          categoria: data.categoria,
        })
        .returning();

      return nuevo;
    },

    actualizarArticulo: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarArticuloSchema.parse(input);

      const [actualizado] = await db
        .update(articulo)
        .set({
          ...(data.codigo !== undefined && { codigo: data.codigo }),
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
          ...(data.unidadMedida !== undefined && { unidadMedida: data.unidadMedida }),
          ...(data.categoria !== undefined && { categoria: data.categoria }),
          actualizadoEn: new Date(),
        })
        .where(eq(articulo.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Artículo no encontrado", { extensions: { code: "NOT_FOUND" } });
      return actualizado;
    },

    toggleArticulo: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const existing = await db.select().from(articulo).where(eq(articulo.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Artículo no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(articulo)
        .set({ activo: !existing[0].activo, actualizadoEn: new Date() })
        .where(eq(articulo.id, id))
        .returning();

      return actualizado;
    },
  },
};
