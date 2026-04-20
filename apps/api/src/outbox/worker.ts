import { and, asc, isNull, sql, lt } from "drizzle-orm";
import { db, outboxEvento } from "@perunor/db";

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 20;
const MAX_INTENTOS = 5;

type Handler = (evento: {
  id: string;
  tipo: string;
  entidad: string;
  entidadId: string;
  payload: unknown;
}) => Promise<void>;

const handlers: Record<string, Handler> = {
  "documento.confirmado": async (e) => {
    console.log(`[outbox] documento.confirmado recibido`, {
      id: e.id,
      documentoId: e.entidadId,
      payload: e.payload,
    });
  },
  "documento.anulado": async (e) => {
    console.log(`[outbox] documento.anulado recibido`, {
      id: e.id,
      documentoId: e.entidadId,
      payload: e.payload,
    });
  },
};

async function procesarLote() {
  const pendientes = await db
    .select()
    .from(outboxEvento)
    .where(and(isNull(outboxEvento.procesadoEn), lt(outboxEvento.intentos, MAX_INTENTOS)))
    .orderBy(asc(outboxEvento.creadoEn))
    .limit(BATCH_SIZE);

  for (const e of pendientes) {
    const handler = handlers[e.tipo];
    try {
      if (handler) {
        await handler({
          id: e.id,
          tipo: e.tipo,
          entidad: e.entidad,
          entidadId: e.entidadId,
          payload: e.payload,
        });
      } else {
        console.warn(`[outbox] sin handler para tipo "${e.tipo}"`);
      }
      await db
        .update(outboxEvento)
        .set({ procesadoEn: new Date() })
        .where(sql`${outboxEvento.id} = ${e.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[outbox] error procesando ${e.id}:`, msg);
      await db
        .update(outboxEvento)
        .set({
          intentos: e.intentos + 1,
          ultimoError: msg,
        })
        .where(sql`${outboxEvento.id} = ${e.id}`);
    }
  }
}

let timer: ReturnType<typeof setInterval> | null = null;

export function startOutboxWorker() {
  if (timer) return;
  console.log("[outbox] worker iniciado");
  const tick = () => {
    procesarLote().catch((err) => console.error("[outbox] loop error:", err));
  };
  tick();
  timer = setInterval(tick, POLL_INTERVAL_MS);
}

export function stopOutboxWorker() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
