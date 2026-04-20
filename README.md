# Perunor ERP — Agroindustrial (Paprika)

Sistema ERP moderno para gestión de compra de materia prima, procesamiento, inventario, facturación y reportes operativos.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Bun |
| Monorepo | Bun workspaces + Turborepo |
| API | Apollo Server 4 + Fastify |
| ORM | Drizzle ORM |
| Base de datos | PostgreSQL 16 |
| Frontend | React 19 + Vite + Apollo Client |
| Auth | Passwordless OTP + JWT (cookie httpOnly) |
| Validación | Zod |

## Instalación

### Requisitos
- [Bun](https://bun.sh) (>=1.0)
- Docker & Docker Compose
- Git

### Pasos

```bash
git clone https://github.com/raf4el12/perunor-core.git
cd perunor-core

# Instalar dependencias
bun install

# Levantar PostgreSQL
docker compose up -d

# Crear tablas
bun db:push

# Iniciar dev (API :4000 + Web :3000)
bun dev
```

## Estructura

```
apps/
  api/          Apollo Server + Fastify, puerto 4000
  web/          React + Vite, puerto 3000
packages/
  db/           Drizzle schema + migraciones
  shared/       Zod schemas, tipos comunes
```

## Módulo Settings — Maestros (7/7 completados)

| Maestro | Campos | Status |
|---------|--------|--------|
| **Artículo** | código, nombre, unidad, categoría, descripción | ✅ |
| **Almacén** | código, nombre, ubicación | ✅ |
| **Proceso** | nombre, descripción | ✅ |
| **Proveedor** | RUC, nombre, contacto | ✅ |
| **Cliente** | RUC, nombre, contacto | ✅ |
| **Conductor** | DNI (8 dígitos), nombres, apellidos, licencia, teléfono, placa | ✅ |
| **Usuario** | nombre, email, rol (admin/operador), passwordless OTP | ✅ |

Cada uno con: CRUD, búsqueda, paginación, toggle estado (activo/inactivo).

## Variables de entorno

Crear `apps/api/.env`:
```
DATABASE_URL=postgresql://perunor:perunor@localhost:5432/perunor_dev
JWT_SECRET=tu-secreto-aqui
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@tudominio.com
PORT=4000
```

## Comandos

```bash
bun install              # Instalar dependencias
bun dev                  # API + Web en dev
bun build                # Build producción
docker compose up -d     # Levantar Postgres
bun db:push              # Migrar BD
bun db:studio            # Drizzle Studio (GUI visual)
```

## Auth

Sistema passwordless OTP:
1. Usuario ingresa email
2. Recibe código por email (Resend)
3. Verifica código → JWT en cookie httpOnly
4. Protección en resolvers GraphQL con `usuarioId`

## Patrón de implementación: Vertical Slice (Settings)

Cada maestro sigue la **misma arquitectura** (replicable):

```
1. DB Layer (packages/db/src/schema/[entidad].ts)
   → Drizzle table definition + enum si aplica
   → Export en schema/index.ts

2. Shared Layer (packages/shared/src/schemas/[entidad].ts)
   → Zod schemas: Crear[Entidad]Schema, Actualizar[Entidad]Schema
   → Type exports con z.infer<>
   → Export en shared/index.ts

3. API Layer (apps/api/src/graphql/)
   → schema.ts: type [Entidad], input Crear/Actualizar, Query + Mutation
   → resolvers/[entidad].ts: CRUD + search
   → resolvers/index.ts: register queries/mutations

4. Web Layer (apps/web/src/pages/settings/)
   → [Entidad]sPage.tsx: list, search, modal create/edit, toggle
   → GraphQL queries/mutations con Apollo Client
   → App.tsx: route /settings/[entidades]
   → HomePage.tsx: navigation link
```

**Ejemplo:** Ver `Proveedor` o `Conductor` para patrón estándar.

## Roadmap

### Core Features (Post-MVP)
1. **Documento polimórfico** ✅
   - Un tipo `Documento` con discriminador: `compra | procesamiento | salida | factura`
   - Referencias a maestros (proveedor/cliente, almacén, conductor, artículos)
   - Máquina de estados: borrador → confirmado → anulado
   - Numeración atómica por tipo/año (`C-2026-000001`)
   - Outbox pattern para eventos (`documento.confirmado`, `documento.anulado`)
   - UI: lista con filtros (tipo/estado) + editor con líneas dinámicas

2. **Kardex e Inventario** (siguiente)
   - Kardex: movimientos de stock por artículo/almacén
   - Valuación: FIFO, promedio ponderado
   - Alertas de stock mínimo

3. **Reportes operativos**
   - Compras por período/proveedor
   - Movimientos de almacén
   - Análisis de costos (paprika procesada)

### Post-MVP (separados)
- **SUNAT/Facturación**: integración con API de SUNAT (proyecto separado)
- **Analytics**: dashboards con datos históricos

## Licencia

Privado (Paprika ERP)
