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
- [ ] Documento polimórfico (core del ERP)
- [ ] Inventario / Kardex
- [ ] Reportes

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
Diseñar el **Documento polimórfico** (core del ERP):
- Un solo tipo `Documento` con discriminador `tipo: compra | procesamiento | salida | factura`.
- Header común (fecha, estado, observaciones) + referencias a maestros (proveedor/cliente, almacén, conductor).
- Líneas (`DocumentoLinea`) con artículo, cantidad, unidad, precio, proceso opcional.
- Máquina de estados: `borrador → confirmado → anulado` con transiciones controladas.
- Outbox pattern para eventos al confirmar (dispara kardex).
