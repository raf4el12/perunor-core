# Equipo — Roles y Responsabilidades

## Miembros

| Nombre | Rol | Responsabilidad |
|--------|-----|-----------------|
| Gomer Rafael | Lead | Arquitectura, decisiones, oversight |
| [Tu Compañero] | Developer | Features, bugs, refactoring |

## Onboarding para nuevo contributor

### Día 1: Setup + Contexto

1. Fork/clone repo
2. `bun install && docker compose up -d && bun db:push`
3. `bun dev` (verificar que corra)
4. Leer:
   - `README.md` (stack, estructura)
   - `CLAUDE.md` (decisiones cerradas)
   - `CONTRIBUTING.md` (patrón de maestros)
   - `GITFLOW.md` (workflow)

### Día 2: Primera feature pequeña

- Ayudar a terminar **Conductor** o **Usuario**
- Seguir patrón de CONTRIBUTING.md
- PR a `develop`
- Code review con Lead

### Semana 1: Ramping up

- 2-3 features pequeñas
- Familiaridad con stack (Zod, GraphQL, React)
- Entender patrones de DB + resolvers

## Communication

- **Issues**: Feature tracking, bugs, discussions
- **Pull Requests**: Code review, discusiones técnicas
- **Discord/Slack**: Preguntas rápidas, blockers
- **Weekly sync**: Alineación, blockers, plan semanal

## Code ownership

| Área | Owner | Reviewer |
|------|-------|----------|
| `packages/db/` | Gomer | Compañero |
| `packages/shared/` | Gomer | Compañero |
| `apps/api/` | Ambos | Cruzado |
| `apps/web/` | Ambos | Cruzado |
| Docs | Gomer | Ambos |

## Standards

### Antes de push

```bash
# Verificar tipos TypeScript
bun run type-check  # (cuando esté setup)

# Formato (cuando esté setup)
bun run format

# Tests (cuando existan)
bun run test
```

### Antes de merge a develop

- [ ] All checks pass
- [ ] Aprobado por reviewer
- [ ] No conflictos
- [ ] Branch actualizado con develop

### Antes de merge a master

- [ ] Tested en dev localmente
- [ ] DB migrations sin errores
- [ ] Changelog actualizado
- [ ] Version bumped semánticamente

## Decisiones

### Para cambios pequeños (días)
- Comentar en issue/PR
- Lead da feedback
- Merge directo

### Para cambios medianos (semanas)
- Crear issue de discussión
- Diseño en Markdown
- Lead aprueba
- Feature branch → PR

### Para cambios grandes (refactoring, nuevos módulos)
- Crear GitHub Discussion
- Documento de diseño (RFC)
- Feedback del equipo
- Aprobación de Lead
- Implementation plan

## Escalation

**Si estás bloqueado** (>30 min):
- Ping a Lead en Slack/Discord
- Descripción breve del bloqueo
- Próximas 2 horas: respuesta

**Si hay conflicto técnico**:
- Crear issue de discussión
- Proponer 2 soluciones
- Lead decide

**Si algo se rompe en producción**:
- Rollback inmediato (revert PR)
- Root cause analysis
- Hotfix rama → master
- Post mortem (si critical)

## Learning resources

- **GraphQL**: docs en apollo.graphql.com
- **Drizzle ORM**: orm.drizzle.team
- **Zod**: zod.dev
- **React 19**: react.dev
- **Perunor patterns**: CONTRIBUTING.md + código existente

## Meeting schedule

- **Daily standup** (async): Slack/Discord
- **Weekly sync** (30 min): Tech + blockers
- **Bi-weekly retro** (30 min): Qué funcionó, qué mejorar
