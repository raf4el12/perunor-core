import { and, desc, eq, count, sql } from "drizzle-orm";
import {
  kardexMovimiento,
  articulo,
  almacen,
  documento,
} from "@perunor/db";
import { GraphQLError } from "graphql";
import type { ApolloContext } from "../../context";

export const kardexResolvers = {
  Query: {
    kardex: async (
      _: unknown,
      {
        articuloId,
        almacenId,
        page = 1,
        limit = 50,
      }: { articuloId: string; almacenId: string; page?: number; limit?: number },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(200, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const whereClause = and(
        eq(kardexMovimiento.articuloId, articuloId),
        eq(kardexMovimiento.almacenId, almacenId),
      );

      const [items, countResult] = await Promise.all([
        db
          .select()
          .from(kardexMovimiento)
          .where(whereClause)
          .orderBy(desc(kardexMovimiento.creadoEn))
          .limit(safeLimit)
          .offset(offset),
        db.select({ total: count() }).from(kardexMovimiento).where(whereClause),
      ]);

      return { items, total: Number(countResult[0].total), page: safePage, limit: safeLimit };
    },

    stockActual: async (
      _: unknown,
      {
        almacenId,
        search,
        page = 1,
        limit = 50,
      }: { almacenId?: string; search?: string; page?: number; limit?: number },
      { db, usuarioId }: ApolloContext,
    ) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(200, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const almacenFiltro = almacenId ? sql`AND km.almacen_id = ${almacenId}` : sql``;
      const searchFiltro = search
        ? sql`AND (a.nombre ILIKE ${"%" + search + "%"} OR a.codigo ILIKE ${"%" + search + "%"})`
        : sql``;

      const items = await db.execute<{
        articulo_id: string;
        almacen_id: string;
        cantidad: string;
        costo: string;
        costo_unitario: string;
        ultima_fecha: string | null;
      }>(sql`
        SELECT DISTINCT ON (km.articulo_id, km.almacen_id)
          km.articulo_id,
          km.almacen_id,
          km.saldo_cantidad AS cantidad,
          km.saldo_costo AS costo,
          km.saldo_costo_unitario AS costo_unitario,
          km.creado_en AS ultima_fecha
        FROM kardex_movimiento km
        INNER JOIN articulo a ON a.id = km.articulo_id
        WHERE 1=1 ${almacenFiltro} ${searchFiltro}
        ORDER BY km.articulo_id, km.almacen_id, km.creado_en DESC
        LIMIT ${safeLimit} OFFSET ${offset}
      `);

      const totalRes = await db.execute<{ total: string }>(sql`
        SELECT COUNT(*)::text AS total FROM (
          SELECT DISTINCT km.articulo_id, km.almacen_id
          FROM kardex_movimiento km
          INNER JOIN articulo a ON a.id = km.articulo_id
          WHERE 1=1 ${almacenFiltro} ${searchFiltro}
        ) s
      `);

      return {
        items: (items as any).map((r: any) => ({
          articuloId: r.articulo_id,
          almacenId: r.almacen_id,
          cantidad: r.cantidad,
          costo: r.costo,
          costoUnitario: r.costo_unitario,
          ultimaFecha: r.ultima_fecha ? new Date(r.ultima_fecha).toISOString() : null,
        })),
        total: Number((totalRes as any)[0]?.total ?? 0),
        page: safePage,
        limit: safeLimit,
      };
    },
  },

  KardexMovimiento: {
    articulo: async (row: any, _: unknown, { db }: ApolloContext) =>
      (await db.select().from(articulo).where(eq(articulo.id, row.articuloId)).limit(1))[0] ?? null,
    almacen: async (row: any, _: unknown, { db }: ApolloContext) =>
      (await db.select().from(almacen).where(eq(almacen.id, row.almacenId)).limit(1))[0] ?? null,
    documento: async (row: any, _: unknown, { db }: ApolloContext) =>
      row.documentoId
        ? (await db.select().from(documento).where(eq(documento.id, row.documentoId)).limit(1))[0] ?? null
        : null,
  },

  StockItem: {
    articulo: async (row: any, _: unknown, { db }: ApolloContext) =>
      (await db.select().from(articulo).where(eq(articulo.id, row.articuloId)).limit(1))[0] ?? null,
    almacen: async (row: any, _: unknown, { db }: ApolloContext) =>
      (await db.select().from(almacen).where(eq(almacen.id, row.almacenId)).limit(1))[0] ?? null,
  },
};
