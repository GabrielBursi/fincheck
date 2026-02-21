# apps/api — NestJS HTTP Adapter

Read `../../docs/architecture.md` and `../../docs/domain.md` before making changes here.

## Role of This App

`apps/api` is **only** an HTTP adapter. Its responsibilities:
1. Receive HTTP requests and validate input (DTOs + class-validator).
2. Call use cases from `packages/core`.
3. Translate domain errors → HTTP exceptions.
4. Return typed API responses.

**Business logic does not live here.**

## Module Structure

```
src/
├── core/
│   ├── filters/http-exception.filter.ts   # Global exception → JSON
│   ├── guards/jwt-auth.guard.ts           # JWT validation
│   └── interceptors/                      # (logging, transform if needed)
├── shared/
│   ├── decorators/
│   │   ├── active-user-id.decorator.ts   # Extracts userId from JWT
│   │   └── is-public.decorator.ts        # Bypasses JWT guard
│   └── pipes/
│       ├── optional-parse-uuid.pipe.ts
│       └── optional-parse-enum.pipe.ts
├── database/
│   ├── prisma.service.ts
│   └── repositories/                      # Prisma implementations of core interfaces
└── modules/
    ├── auth/
    ├── bank-accounts/
    ├── transactions/
    ├── categories/
    ├── goals/
    └── users/
```

## Module File Template

Each module follows this pattern:
```
modules/[domain]/
├── [domain].module.ts
├── [domain].controller.ts         # HTTP wiring only
├── dto/
│   ├── create-[domain].dto.ts     # class-validator input
│   └── update-[domain].dto.ts
└── types/
    └── [domain].types.ts          # Response types (no decorators)
```

Services are intentionally omitted from the module layer — use cases from `packages/core` replace them.

## Controller Rules

- Every controller must have a `GET admin/test` smoke test endpoint.
- Use `@ActiveUserId()` to get the current user — never trust request body for userId.
- Params: `ParseUUIDPipe` for IDs. `OptionalParseUUIDPipe` / `OptionalParseEnumPipe` for optional query params.
- Response types come from `packages/core` output types — do NOT expose Prisma models directly.

## Error Translation

```typescript
// In module-level service (thin wrapper):
try {
  return await this.useCase.execute(input);
} catch (err) {
  if (err instanceof NotFoundError) throw new NotFoundException(err.message);
  if (err instanceof UnauthorizedError) throw new ForbiddenException(err.message);
  if (err instanceof ConflictError) throw new ConflictException(err.message);
  throw err; // re-throw unexpected errors to global filter
}
```

## Database

- ORM: **Prisma** with PostgreSQL.
- Schema: `prisma/schema.prisma`.
- Migrations: `pnpm db:migrate`.
- `PrismaService` extends `PrismaClient` and is provided globally.
- Repository implementations in `src/database/repositories/` inject `PrismaService`.

## Auth

- JWT secret in `JWT_SECRET` env var.
- Token payload: `{ sub: userId }`.
- `JwtAuthGuard` is applied globally. Routes decorated with `@IsPublic()` bypass it.
- `@ActiveUserId()` pulls `req.user.sub`.

## Swagger

- All controllers are documented with `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation`.
- DTOs use `@ApiProperty` for each field.
- Swagger UI available at `/api/docs` in development.

## Test Commands

```bash
pnpm test                  # jest unit
pnpm test:e2e              # jest e2e (requires running DB)
pnpm test:cov              # coverage report
```

## What Claude Gets Wrong Here

- Do NOT write business logic in controllers or module-level services.
- Do NOT return Prisma model types from controllers — always map to response types.
- Do NOT inject `PrismaService` in controllers — only in repository implementations.
- Do NOT skip `@ApiProperty` decorators on DTO fields.
- Do NOT use `@Patch` for full resource updates — use `@Put`.
