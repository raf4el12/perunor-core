# perunor-core — ERP Agroindustrial (Paprika)

## Contexto del proyecto
Migración de un sistema ERP legacy (.NET 4 Web Forms + SQL Server) a un stack moderno.
Sistema orientado a: compra de materia prima, procesamiento, inventario, facturación y reportes operativos.

## Decisiones cerradas (no debatir)
- **Runtime**: Bun. No Node LTS.
- **DB**: PostgreSQL. Single-tenant, sin empresa_id global.
- **Data**: arrancamos en limpio, sin migración del legacy.
- **Email**: Resend para passwordless OTP.
- **SUNAT**: post-MVP, proyecto separado. No diseñar para eso aún.
- **Eventos**: outbox pattern en Postgres + worker simple. Sin RabbitMQ por ahora.

## Stack
| Capa | Tecnología |
|---|---|
| Runtime | Bun |
| Monorepo | Bun workspaces + Turborepo |
| API | Apollo Server 4 + Fastify |
| ORM | Drizzle ORM |
| DB | PostgreSQL 16 |
| Frontend | React 19 + Vite + Apollo Client |
| Auth | Passwordless OTP + JWT (cookie httpOnly) |
| Email | Resend |
| Validación | Zod |
| Tipado | TypeScript 5 + codegen (pendiente) |

## Estructura del monorepo
```
apps/
  api/       ← Apollo Server + Bun HTTP, puerto 4000
  web/       ← React + Vite, puerto 3000
packages/
  db/        ← Drizzle schema + migraciones
  shared/    ← Zod schemas, tipos base
```

## Estado actual
- [x] Monorepo inicializado con Bun workspaces + Turborepo
- [x] packages/db — Drizzle configurado, schema: `usuario`, `otp_code`
- [x] packages/shared — Zod schemas de auth y tipos comunes
- [x] apps/api — Apollo Server + auth passwordless completo (requestOtp, verifyOtp, me)
- [x] apps/web — React + login passwordless (email → OTP → JWT)
- [x] docker-compose.yml con Postgres 16
- [ ] Primer `bun install` + `bun db:push` (pendiente ejecutar)
- [x] Módulo Settings — Artículo, Almacén, Proceso, Proveedor, Cliente, Conductor, Usuario (CRUD completo: DB → GraphQL → UI)
- [x] Documento polimórfico (core del ERP) — tipos: compra/procesamiento/salida/factura, máquina de estados borrador→confirmado→anulado, numeración atómica por tipo/año, outbox pattern
- [x] Inventario / Kardex — tabla `kardex_movimiento`, valuación promedio ponderado, handler consume outbox, UI stock + kardex
- [~] Reportes — compras por período/proveedor ✅, movimientos de almacén ✅, CSV export ✅. Pendientes: costos de procesamiento, alertas stock mínimo.

## Comandos clave
```bash
bun install          # instalar dependencias
docker compose up -d # levantar Postgres
bun db:push          # crear tablas
bun dev              # levantar API (4000) + Web (3000)
bun db:studio        # Drizzle Studio (explorador visual de DB)
```

## Variables de entorno (apps/api/.env)
```
DATABASE_URL=postgresql://perunor:perunor@localhost:5432/perunor_dev
JWT_SECRET=...
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@tudominio.com
PORT=4000
```

## Patrones de código
- Resolvers van en `apps/api/src/graphql/resolvers/[modulo].ts`
- Schema GraphQL en `apps/api/src/graphql/schema.ts`
- Tablas Drizzle en `packages/db/src/schema/[entidad].ts`, exportadas desde `schema/index.ts`
- Tipos/validaciones compartidos en `packages/shared/src/schemas/[dominio].ts`
- Siempre validar con Zod en resolvers antes de tocar la DB
- Auth: verificar `context.usuarioId` al inicio de cada resolver protegido

## Próximo paso
**Reportes avanzados + alertas** (los dos primeros reportes ya están listos):
- Análisis de costos de paprika procesada — vincular egreso de materia prima con ingreso de producto terminado vía `documento.tipo=procesamiento`, calcular costo real del PT a partir del costo ponderado de los insumos.
- Alertas de stock mínimo — umbral por artículo (nuevo campo `articulo.stockMinimo`) → query sobre `stockActual` filtrando por `cantidad < stockMinimo`.

## Módulo Documento (implementado)
- Tablas: `documento`, `documento_linea`, `contador_documento` (numeración atómica por tipo/año), `outbox_evento`.
- Estados: `borrador → confirmado → anulado`. Solo borradores son editables/eliminables.
- Numeración: se asigna en `confirmarDocumento` vía `INSERT ... ON CONFLICT DO UPDATE` sobre `contador_documento`. Prefijos: `C` (compra), `P` (procesamiento), `S` (salida), `F` (factura).
- Outbox: al confirmar/anular se inserta fila en `outbox_evento`; worker poll cada 5s, máx 5 reintentos por fila.
- Decimales: `numeric(14,4)` en DB, expuestos como `String` en GraphQL (evita pérdida de precisión).

## Módulo Kardex (implementado)
- Tabla: `kardex_movimiento` con saldo post-movimiento cacheado (`saldo_cantidad`, `saldo_costo`, `saldo_costo_unitario`) — evita recomputar todo el historial.
- Valuación: **promedio ponderado móvil**. En ingreso: `saldoCosto += cant * costoUnit`, recalcula promedio. En egreso: usa `saldoCostoUnitario` previo como costo de salida.
- Handler en `apps/api/src/outbox/handlers/kardex.ts`:
  - `documento.confirmado` → inserta una fila de kardex por cada `documento_linea`, respetando `movimiento` (ingreso/egreso) y almacén (para `procesamiento`: ingresos van a `almacen_destino_id`).
  - `documento.anulado` → inserta movimientos inversos (mismas cantidades y costos originales), con `referencia = ANULA-{numero}`.
- Idempotencia: el handler checa si ya existen filas para `(documento_id, referencia)` antes de insertar.
- Stock actual: query con `DISTINCT ON (articulo_id, almacen_id) ... ORDER BY creado_en DESC` sobre `kardex_movimiento`.
- Saldos negativos permitidos (se muestran en rojo en UI) — escenario real de data parcial.
- Limitación conocida: costo de producto terminado en `procesamiento` usa `precioUnitario` de la línea directamente (no se calcula desde el costo real de los insumos egresados).

## Módulo Reportes (parcial)
- Resolver `apps/api/src/graphql/resolvers/reporte.ts` con dos queries:
  - `reporteCompras(desde, hasta, proveedorId?)` — detalle + agregado `porProveedor` (calculado en memoria con `Map`, ordenado por total desc) + totales.
  - `reporteMovimientos(desde, hasta, almacenId?, articuloId?)` — kardex filtrado con joins a `articulo` y `almacen`, totales de cantidad/valor por ingreso/egreso.
- Validación de rango: `validarRango` enforces `YYYY-MM-DD` y `desde <= hasta`. Para `reporteMovimientos`, convierte fechas a timestamps (`00:00:00Z` / `23:59:59.999Z`) porque `kardex_movimiento.fecha` es `timestamp`.
- Helper CSV en `apps/web/src/lib/csv.ts` — escapa `,`, `"`, `\n` y emite con BOM UTF-8 (compatible Excel). Usado por ambas páginas de reportes.
- UI en `apps/web/src/pages/reportes/` — ambas páginas usan `useLazyQuery` (ejecución on-demand), default range = primer día del mes a hoy.
