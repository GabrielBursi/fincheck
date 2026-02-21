# Fincheck — Claude Code Context

Fincheck is a personal finance management app. Users track bank accounts, transactions, categories, goals, and shared accounts.

## Monorepo Structure

```
fincheck/
├── apps/
│   ├── api/          # NestJS HTTP adapter (see apps/api/CLAUDE.md)
│   └── web/          # React frontend (see apps/web/CLAUDE.md)
├── packages/
│   └── core/         # Domain + use cases — framework-agnostic
│       ├── domain/   # Entities, value objects, domain errors, repository interfaces
│       └── application/ # Use cases (one file = one use case)
└── docs/
    ├── architecture.md  # Architectural decisions and layer rules
    └── domain.md        # Domain model, entities, and relationships
```

## Key Architectural Rules

- **Dependency direction**: `api` → `core`. Never `core` → `api`.
- `packages/core` has **zero NestJS imports**. No decorators, no DI tokens.
- Use cases live in `packages/core/application/` — one class per file, named `VerbNounUseCase`.
- Repository interfaces are defined in `packages/core/domain/` and implemented in `apps/api/`.
- Read `docs/architecture.md` before creating new modules or use cases.
- Read `docs/domain.md` before touching entities or business rules.

## Common Commands

```bash
# Root
pnpm install              # install all workspaces
pnpm build                # build all packages

# API (apps/api)
pnpm --filter api dev     # start dev server
pnpm --filter api test    # unit tests
pnpm --filter api test:e2e # e2e tests
pnpm --filter api db:migrate  # run prisma migrations

# Web (apps/web)
pnpm --filter web dev     # start vite dev server
pnpm --filter web build   # production build
pnpm --filter web test    # vitest

# Core
pnpm --filter core build  # compile domain/application layer
pnpm --filter core test   # unit tests (no DB, no HTTP)
```

## Non-Negotiable Rules

- **Zero `any`** — use `unknown` and narrow explicitly.
- **No `export default`** anywhere in the codebase.
- File and directory names: `kebab-case`.
- Class names: `PascalCase`. Functions/variables: `camelCase`.
- Max 20 lines per function. Max 300 lines per file.
- All public functions/classes have JSDoc.
- Tests follow AAA (unit) or Given-When-Then (e2e). Variables: `inputX`, `mockX`, `actualX`, `expectedX`.
- Run `pnpm typecheck && pnpm lint` before declaring a task done.

## What Claude Gets Wrong Here

- Do NOT put business logic in `apps/api/` services — it belongs in `packages/core/application/`.
- Do NOT import Prisma types into `packages/core/` — map to domain types at the repository implementation layer.
- Do NOT use `enum` — use `const` objects + union types (see TYPESCRIPT_RULES.md).
- Do NOT throw generic `new Error()` in NestJS — use Nest's HTTP exceptions.
- Do NOT create barrel `index.ts` files that re-export everything — import directly from source files.
