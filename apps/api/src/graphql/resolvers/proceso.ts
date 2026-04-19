import { eq, ilike, count, asc } from "drizzle-orm";
import { proceso } from "@perunor/db";
import { CrearProcesoSchema, ActualizarProcesoSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const procesoResolvers = {
  Query: {
    procesos: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search ? ilike(proceso.nombre, `%${search}%`) : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(proceso).where(whereClause).orderBy(asc(proceso.nombre)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(proceso).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    proceso: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(proceso).where(eq(proceso.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearProceso: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearProcesoSchema.parse(input);

      const [nuevo] = await db
        .insert(proceso)
        .values({
          nombre: data.nombre,
          descripcion: data.descripcion || null,
        })
        .returning();

      return nuevo;
    },

    actualizarProceso: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarProcesoSchema.parse(input);

      const [actualizado] = await db
        .update(proceso)
        .set({
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
          actualizadoEn: new Date(),
        })
        .where(eq(proceso.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Proceso no encontrado", { extensions: { code: "NOT_FOUND" } });
      return actualizado;
    },

    toggleProceso: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const existing = await db.select().from(proceso).where(eq(proceso.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Proceso no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(proceso)
        .set({ activo: !existing[0].activo, actualizadoEn: new Date() })
        .where(eq(proceso.id, id))
        .returning();

      return actualizado;
    },
  },
};
