# Contribuir a Perunor Core

## Decisiones arquitectónicas cerradas

No debatir:
- **Runtime**: Bun (no Node LTS)
- **DB**: PostgreSQL single-tenant
- **Datos**: arrancamos en limpio (sin migración legacy)
- **Email**: Resend para OTP
- **Eventos**: outbox pattern en Postgres (post-MVP: RabbitMQ)
- **SUNAT**: proyecto separado (post-MVP)

## Flujo para nuevos maestros

Cada maestro sigue un patrón vertical:

### 1. DB Schema
`packages/db/src/schema/[entidad].ts`
```typescript
export const [entidad] = pgTable("[tabla]", {
  id: uuid("id").primaryKey().defaultRandom(),
  // ... campos
  activo: boolean("activo").notNull().default(true),
  creadoEn: timestamp("creado_en").notNull().defaultNow(),
  actualizadoEn: timestamp("actualizado_en").notNull().defaultNow(),
});
```

### 2. Zod Schemas
`packages/shared/src/schemas/[dominio].ts`
```typescript
export const CrearSchema = z.object({ /* fields */ });
export const ActualizarSchema = CrearSchema.partial();
export type CrearInput = z.infer<typeof CrearSchema>;
```

### 3. GraphQL Resolver
`apps/api/src/graphql/resolvers/[modulo].ts`
- Siempre validar con Zod
- Siempre verificar `usuarioId` (auth)
- Errores con `GraphQLError(..., { extensions: { code } })`

### 4. GraphQL Schema
Extender `apps/api/src/graphql/schema.ts`:
- Type con campos + timestamps
- PaginadoType (items, total, page, limit)
- Input Create + Actualizar

### 5. React Page
`apps/web/src/pages/settings/[Entidad]Page.tsx`
- Tabla con búsqueda + paginación
- Modal create/edit con validación client
- Mutations para CRUD

### 6. Rutas
- Agregar en `App.tsx`
- Link en `HomePage.tsx`

## Commits

Formato: `feat|fix|refactor|docs: descripción corta`

Ejemplo válido:
```
feat: implement Conductor master (DNI, nombre, licencia)

- DB schema con validación DNI
- GraphQL resolver con CRUD
- UI page con search y toggle
- Tests básicos

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Testing

Por ahora: validación en UI + Zod en backend.

Próximo: tests unitarios en resolvers.

## Performance

- Paginar SIEMPRE (max 100 items per page)
- Índices en campos searchables (nombre, código, ruc, dni)
- N+1: evitar en queries complejas
