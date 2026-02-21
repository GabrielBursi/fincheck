# new-api-module

Creates a full NestJS module in `apps/api/src/modules/`.

## Instructions

1. Read `apps/api/CLAUDE.md` for module conventions.
2. Read `docs/domain.md` to confirm domain concepts for this module.
3. Generate all files listed below.
4. Wire the module into `app.module.ts`.

## Usage

```
/new-api-module <domain>
```

Example: `/new-api-module transactions`

## Files to Create

```
apps/api/src/modules/<domain>/
├── <domain>.module.ts
├── <domain>.controller.ts         # includes GET admin/test smoke test
├── dto/
│   ├── create-<domain>.dto.ts
│   └── update-<domain>.dto.ts
└── types/
    └── <domain>.types.ts          # Response types (plain, no decorators)
```

## Controller Rules

- Every controller MUST have `@Get('admin/test')` smoke test returning `'ok'`.
- Use `@ActiveUserId()` for the authenticated user — not from body.
- Apply `ParseUUIDPipe` to all ID path params.
- Use Nest HTTP exceptions only (`NotFoundException`, `ForbiddenException`, etc.).
- Add `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation` for Swagger.

## Module Rules

- The module imports repository providers (bound to core interfaces).
- No business logic in controller or module — delegate to use cases from `packages/core`.
- Wrap use case calls in try/catch to translate domain errors → HTTP exceptions.
