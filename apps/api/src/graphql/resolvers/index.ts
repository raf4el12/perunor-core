import { eq } from "drizzle-orm";
import { usuario } from "@perunor/db";
import { authResolvers } from "./auth";
import { articuloResolvers } from "./articulo";
import { almacenResolvers } from "./almacen";
import { procesoResolvers } from "./proceso";
import { proveedorResolvers } from "./proveedor";
import { clienteResolvers } from "./cliente";
import { conductorResolvers } from "./conductor";
import { usuarioResolvers } from "./usuario";
import { documentoResolvers } from "./documento";
import type { ApolloContext } from "../../context";
import { GraphQLError } from "graphql";

export const resolvers = {
  Query: {
    health: () => "ok",
    me: async (_: unknown, __: unknown, { db, usuarioId }: ApolloContext) => {
      if (!usuarioId) throw new GraphQLError("No autenticado", { extensions: { code: "UNAUTHENTICATED" } });
      const user = await db.query.usuario.findFirst({ where: eq(usuario.id, usuarioId) });
      return user ? { ...user, activo: user.activo === "1" } : null;
    },
    ...articuloResolvers.Query,
    ...almacenResolvers.Query,
    ...procesoResolvers.Query,
    ...proveedorResolvers.Query,
    ...clienteResolvers.Query,
    ...conductorResolvers.Query,
    ...usuarioResolvers.Query,
    ...documentoResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...articuloResolvers.Mutation,
    ...almacenResolvers.Mutation,
    ...procesoResolvers.Mutation,
    ...proveedorResolvers.Mutation,
    ...clienteResolvers.Mutation,
    ...conductorResolvers.Mutation,
    ...usuarioResolvers.Mutation,
    ...documentoResolvers.Mutation,
  },
  Documento: documentoResolvers.Documento,
  DocumentoLinea: documentoResolvers.DocumentoLinea,
};
