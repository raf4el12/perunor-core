# GitFlow — Flujo de trabajo

Perunor Core usa **GitFlow**: ramas dedicadas para features, releases y hotfixes.

## Ramas principales

- **`master`**: código en producción. Cada commit = release.
- **`develop`**: rama de integración. Base para features.
- **`feature/*`**: nuevas funcionalidades.
- **`release/*`**: preparación de releases.
- **`hotfix/*`**: parches urgentes en producción.

## Flujo para desarrollo

### 1. Nueva feature

```bash
# Actualizar develop
git checkout develop
git pull origin develop

# Crear rama feature
git checkout -b feature/conductor-master
# o: feature/documento-compra, feature/kardex, etc.

# Desarrollar (commits regulares)
git add .
git commit -m "feat: add DNI validation for conductor"

# Push a rama feature
git push -u origin feature/conductor-master
```

**Nombres de ramas**: `feature/descripcion-corta` (kebab-case)

### 2. Pull Request (integración)

En GitHub:
1. Abrir PR: `feature/conductor-master` → `develop`
2. **Título**: `feat: implement Conductor master`
3. **Descripción**:
   ```
   ## Summary
   - DB schema con validación DNI
   - GraphQL resolver CRUD
   - React UI con tabla, search, paginación

   ## Testing
   - [ ] Crear conductor
   - [ ] Editar conductor
   - [ ] Buscar por DNI/nombre
   - [ ] Toggle activo/inactivo
   - [ ] Pagination works

   ## Screenshots (si aplica)
   - [x] Screenshots de la UI
   ```
4. Asignar reviewers (compañero)
5. Esperar aprobación
6. **Squash & merge** a `develop`

### 3. Release a master

Cuando `develop` está listo para producción:

```bash
# Crear rama release
git checkout -b release/v0.2.0 develop

# Bump version, changelog
# (manual o script)

git commit -m "chore: bump version to 0.2.0"
git push -u origin release/v0.2.0
```

En GitHub:
1. PR: `release/v0.2.0` → `master`
2. Esperar aprobación
3. **Merge** (no squash) a `master`
4. Crear tag: `v0.2.0`
5. Merge `master` de vuelta a `develop`

```bash
git checkout release/v0.2.0
git tag -a v0.2.0 -m "Release v0.2.0"
git push origin v0.2.0
```

### 4. Hotfix en producción

Si hay bug crítico en `master`:

```bash
# Crear hotfix desde master
git checkout -b hotfix/ruc-validation master

# Fijar bug, commit
git commit -m "fix: allow RUC with leading zeros"

git push -u origin hotfix/ruc-validation
```

En GitHub:
1. PR: `hotfix/ruc-validation` → `master`
2. Merge a `master`
3. Tag: `v0.2.1`
4. Merge `master` de vuelta a `develop`

## Convenciones de commits

**Formato**: `<tipo>: <descripción>`

Tipos:
- `feat:` nueva funcionalidad
- `fix:` corrección de bug
- `refactor:` cambio sin funcionalidad nueva
- `docs:` documentación
- `chore:` deps, config, versioning
- `test:` tests o testing

**Ejemplos válidos**:
```
feat: implement Conductor master CRUD
fix: validate RUC length before insert
refactor: extract pagination logic to hook
docs: add GitFlow guide
chore: bump @apollo/client to 3.9.0
```

**NO válidos**:
```
Fixed stuff              ❌ (vago, sin tipo)
wip: conductor           ❌ (commits WIP no van a main)
update                   ❌ (sin descripción)
```

## Estrategia de merge

- **Feature → Develop**: **Squash & merge** (1 commit limpio)
- **Release → Master**: **Merge commit** (preserva historia)
- **Hotfix → Master**: **Merge commit**
- **Master → Develop**: **Merge commit** (sincronizar ramas)

## Code Review

Checklist antes de aprobar PR:

- [ ] Código sigue patrones de perunor-core
- [ ] Tests pasan (cuando sea aplicable)
- [ ] No hay conflictos con `develop`
- [ ] DB migrations están presentes (si aplica)
- [ ] Commits tienen mensajes claros
- [ ] No hay `console.log`, `debugger`, etc.
- [ ] TypeScript sin errors (`// @ts-ignore` = rechazar)

**Rechazar si**:
- Violaciones de seguridad (hardcoded keys, SQL injection risk)
- Cambios en decisiones cerradas (runtime, DB, etc.)
- Sin validación Zod en input del resolver
- DB schema sin `creadoEn`/`actualizadoEn`

## Setup inicial para nuevo contributor

```bash
# 1. Fork repo en GitHub (opcional, si no tienes push)
# 2. Clone
git clone https://github.com/raf4el12/perunor-core.git
cd perunor-core

# 3. Configurar remotes (si forkeaste)
git remote add upstream https://github.com/raf4el12/perunor-core.git

# 4. Instalar deps
bun install

# 5. Crear rama feature
git checkout -b feature/tu-feature develop
```

## Sincronizar con develop

Antes de abrir PR:

```bash
git fetch origin
git rebase origin/develop

# Si hay conflictos, resolverlos y:
git add .
git rebase --continue
git push -f origin feature/tu-feature
```

## Protecciones de rama (GitHub)

**`master`**:
- Requiere PR review
- Requiere pasar checks
- Bloquea merge con conflictos
- Requiere update antes de merge

**`develop`**:
- Requiere PR review
- Requiere pasar checks
- Dismiss stale reviews si hay pushes

## Ejemplo completo: Conductor

```bash
# 1. Actualizar develop
git checkout develop
git pull origin develop

# 2. Feature branch
git checkout -b feature/conductor-master

# 3. Desarrollar (múltiples commits)
git add packages/db/src/schema/conductor.ts
git commit -m "feat: add Conductor schema with DNI validation"

git add packages/shared/src/schemas/conductor.ts
git commit -m "feat: add Conductor Zod schemas"

git add apps/api/src/graphql/resolvers/conductor.ts
git commit -m "feat: add Conductor GraphQL resolver"

# ... más commits

# 4. Push
git push -u origin feature/conductor-master

# 5. En GitHub: abrir PR feature/conductor-master → develop
# 6. Esperar review + aprobación
# 7. Squash & merge en GitHub
# 8. Delete remote branch

# 9. En local, limpiar
git checkout develop
git pull origin develop
git branch -d feature/conductor-master
```

## Tips

- **1 feature = 1 rama**: no mezcles features
- **Pequeños PRs**: <500 líneas, más fácil de revisar
- **Commits atómicos**: 1 commit = 1 cambio lógico
- **Push frecuente**: diario, para no perder trabajo
- **Rebase vs Merge**: rebase para features, merge para releases
