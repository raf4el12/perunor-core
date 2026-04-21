import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "@perunor/db";
import { verifyToken } from "./lib/jwt";

export interface ApolloContext {
  db: typeof db;
  usuarioId: string | null;
  rol: string | null;
}

export async function buildContext(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<ApolloContext> {
  let usuarioId: string | null = null;
  let rol: string | null = null;

  let cookieToken: string | undefined;
  try { cookieToken = request.cookies?.["token"]; } catch { cookieToken = undefined; }
  const token = cookieToken ?? request.headers?.authorization?.replace("Bearer ", "");

  if (token) {
    const payload = await verifyToken(token).catch(() => null);
    if (payload) {
      usuarioId = payload.sub as string;
      rol = payload.rol as string;
    }
  }

  return { db, usuarioId, rol };
}
