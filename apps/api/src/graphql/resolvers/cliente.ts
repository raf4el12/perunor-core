import { eq, ilike, or, count, asc } from "drizzle-orm";
import { cliente } from "@perunor/db";
import { CrearClienteSchema, ActualizarClienteSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const clienteResolvers = {
  Query: {
    clientes: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search
        ? or(ilike(cliente.nombre, `%${search}%`), ilike(cliente.ruc, `%${search}%`))
        : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(cliente).where(whereClause).orderBy(asc(cliente.nombre)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(cliente).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    cliente: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(cliente).where(eq(cliente.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearCliente: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearClienteSchema.parse(input);

      const [nuevo] = await db
        .insert(cliente)
        .values({
          ruc: data.ruc,
          nombre: data.nombre,
          contacto: data.contacto || null,
        })
        .returning();

      return nuevo;
    },

    actualizarCliente: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarClienteSchema.parse(input);

      const [actualizado] = await db
        .update(cliente)
        .set({
          ...(data.ruc !== undefined && { ruc: data.ruc }),
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.contacto !== undefined && { contacto: data.contacto || null }),
          actualizadoEn: new Date(),
        })
        .where(eq(cliente.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Cliente no encontrado", { extensions: { code: "NOT_FOUND" } });
      return actualizado;
    },

    toggleCliente: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const existing = await db.select().from(cliente).where(eq(cliente.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Cliente no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(cliente)
        .set({ activo: !existing[0].activo, actualizadoEn: new Date() })
        .where(eq(cliente.id, id))
        .returning();

      return actualizado;
    },
  },
};
