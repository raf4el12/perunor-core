import { eq, ilike, or, count, asc } from "drizzle-orm";
import { conductor } from "@perunor/db";
import { CrearConductorSchema, ActualizarConductorSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const conductorResolvers = {
  Query: {
    conductores: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search
        ? or(
            ilike(conductor.dni, `%${search}%`),
            ilike(conductor.nombres, `%${search}%`),
            ilike(conductor.apellidos, `%${search}%`),
          )
        : undefined;

      const [items, countResult] = await Promise.all([
        db.select().from(conductor).where(whereClause).orderBy(asc(conductor.apellidos)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(conductor).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    conductor: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(conductor).where(eq(conductor.id, id)).limit(1);
      return result[0] ?? null;
    },
  },

  Mutation: {
    crearConductor: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearConductorSchema.parse(input);

      const [nuevo] = await db
        .insert(conductor)
        .values({
          dni: data.dni,
          nombres: data.nombres,
          apellidos: data.apellidos,
          licencia: data.licencia || null,
          telefono: data.telefono || null,
          placaVehiculo: data.placaVehiculo || null,
        })
        .returning();

      return nuevo;
    },

    actualizarConductor: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarConductorSchema.parse(input);

      const [actualizado] = await db
        .update(conductor)
        .set({
          ...(data.dni !== undefined && { dni: data.dni }),
          ...(data.nombres !== undefined && { nombres: data.nombres }),
          ...(data.apellidos !== undefined && { apellidos: data.apellidos }),
          ...(data.licencia !== undefined && { licencia: data.licencia || null }),
          ...(data.telefono !== undefined && { telefono: data.telefono || null }),
          ...(data.placaVehiculo !== undefined && { placaVehiculo: data.placaVehiculo || null }),
          actualizadoEn: new Date(),
        })
        .where(eq(conductor.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Conductor no encontrado", { extensions: { code: "NOT_FOUND" } });
      return actualizado;
    },

    toggleConductor: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const existing = await db.select().from(conductor).where(eq(conductor.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Conductor no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(conductor)
        .set({ activo: !existing[0].activo, actualizadoEn: new Date() })
        .where(eq(conductor.id, id))
        .returning();

      return actualizado;
    },
  },
};
