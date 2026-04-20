import { eq, ilike, or, count, asc } from "drizzle-orm";
import { usuario } from "@perunor/db";
import { CrearUsuarioSchema, ActualizarUsuarioSchema } from "@perunor/shared";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

type UsuarioRow = typeof usuario.$inferSelect;

const toGraphql = (row: UsuarioRow) => ({ ...row, activo: row.activo === "1" });

export const usuarioResolvers = {
  Query: {
    usuarios: async (
      _: unknown,
      { page = 1, limit = 10, search }: { page?: number; limit?: number; search?: string },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = search
        ? or(ilike(usuario.nombre, `%${search}%`), ilike(usuario.email, `%${search}%`))
        : undefined;

      const [rows, countResult] = await Promise.all([
        db.select().from(usuario).where(whereClause).orderBy(asc(usuario.nombre)).limit(safeLimit).offset(offset),
        db.select({ total: count() }).from(usuario).where(whereClause),
      ]);

      return {
        items: rows.map(toGraphql),
        total: Number(countResult[0].total),
        page: safePage,
        limit: safeLimit,
      };
    },

    usuario: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const result = await db.select().from(usuario).where(eq(usuario.id, id)).limit(1);
      return result[0] ? toGraphql(result[0]) : null;
    },
  },

  Mutation: {
    crearUsuario: async (_: unknown, { input }: { input: unknown }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = CrearUsuarioSchema.parse(input);

      const existing = await db.select().from(usuario).where(eq(usuario.email, data.email)).limit(1);
      if (existing[0]) {
        throw new GraphQLError("Ya existe un usuario con ese email", { extensions: { code: "DUPLICATE" } });
      }

      const [nuevo] = await db
        .insert(usuario)
        .values({ nombre: data.nombre, email: data.email, rol: data.rol })
        .returning();

      return toGraphql(nuevo);
    },

    actualizarUsuario: async (
      _: unknown,
      { id, input }: { id: string; input: unknown },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const data = ActualizarUsuarioSchema.parse(input);

      if (data.email) {
        const existing = await db.select().from(usuario).where(eq(usuario.email, data.email)).limit(1);
        if (existing[0] && existing[0].id !== id) {
          throw new GraphQLError("Ya existe un usuario con ese email", { extensions: { code: "DUPLICATE" } });
        }
      }

      const [actualizado] = await db
        .update(usuario)
        .set({
          ...(data.nombre !== undefined && { nombre: data.nombre }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.rol !== undefined && { rol: data.rol }),
          actualizadoEn: new Date(),
        })
        .where(eq(usuario.id, id))
        .returning();

      if (!actualizado) throw new GraphQLError("Usuario no encontrado", { extensions: { code: "NOT_FOUND" } });
      return toGraphql(actualizado);
    },

    toggleUsuario: async (_: unknown, { id }: { id: string }, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      if (id === usuarioId) {
        throw new GraphQLError("No puedes desactivar tu propia cuenta", { extensions: { code: "FORBIDDEN" } });
      }

      const existing = await db.select().from(usuario).where(eq(usuario.id, id)).limit(1);
      if (!existing[0]) throw new GraphQLError("Usuario no encontrado", { extensions: { code: "NOT_FOUND" } });

      const [actualizado] = await db
        .update(usuario)
        .set({ activo: existing[0].activo === "1" ? "0" : "1", actualizadoEn: new Date() })
        .where(eq(usuario.id, id))
        .returning();

      return toGraphql(actualizado);
    },
  },
};
