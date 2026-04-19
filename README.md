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

## Maestros implementados

- ✅ **Artículo**: código, nombre, descripción, unidad, categoría
- ✅ **Almacén**: nombre, ubicación
- ✅ **Proceso**: nombre, descripción
- ✅ **Proveedor**: RUC, nombre, contacto
- ✅ **Cliente**: RUC, nombre, contacto
- ⏳ **Conductor**: DNI, nombre, licencia
- ⏳ **Usuario**: gestión desde UI

Todos con CRUD completo, búsqueda, paginación y toggle de estado.

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

## Patrones de código

### DB Schema
- Ubicación: `packages/db/src/schema/[entidad].ts`
- Export en: `packages/db/src/schema/index.ts`
- Tipos automáticos con Drizzle

### Validación
- Ubicación: `packages/shared/src/schemas/[dominio].ts`
- Validar en resolver ANTES de tocar BD
- Exportar tipos con `z.infer<>`

### GraphQL Resolver
- Ubicación: `apps/api/src/graphql/resolvers/[modulo].ts`
- Verificar `usuarioId` al inicio (auth)
- Patrones: Query (list + get), Mutation (create, update, toggle)
- Wiring en: `apps/api/src/graphql/resolvers/index.ts`

### UI
- Ubicación: `apps/web/src/pages/settings/[Entidad]Page.tsx`
- Apollo Client con queries/mutations
- Rutas en: `apps/web/src/App.tsx`
- Links en: `apps/web/src/pages/HomePage.tsx`

## Próximos pasos

1. ⏳ Implementar maestros restantes: Conductor, Usuario
2. ⏳ Documento polimórfico (compra | procesamiento | salida | factura)
3. ⏳ Kardex e inventario
4. ⏳ Reportes operativos

## Licencia

Privado (Paprika ERP)
