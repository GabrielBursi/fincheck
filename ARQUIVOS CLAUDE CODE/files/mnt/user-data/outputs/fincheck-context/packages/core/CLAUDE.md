# packages/core — Domain & Application Layer

This package is the heart of fincheck. It has **zero framework dependencies**.

Read `../../docs/architecture.md` and `../../docs/domain.md` before making any changes here.

## Critical Rules

- **NO NestJS imports** — no `@Injectable`, no `@Module`, no DI tokens.
- **NO Prisma imports** — no `@prisma/client` types exposed in domain interfaces.
- **NO Express/HTTP imports** — no `Request`, `Response`, status codes.
- Dependencies allowed: `zod` (validation), `bcrypt`, `jsonwebtoken`, `uuid`.

## Structure

```
src/
├── domain/
│   ├── entities/         # Pure TS classes with business methods
│   ├── value-objects/    # Immutable, self-validating types
│   ├── errors/           # Typed domain errors (extend Error)
│   └── repositories/     # Interfaces only — never implementations
└── application/
    └── use-cases/
        ├── auth/
        ├── bank-accounts/
        ├── transactions/
        ├── categories/
        ├── goals/
        └── users/
```

## Use Case Template

```typescript
// application/use-cases/bank-accounts/create-bank-account.use-case.ts

type CreateBankAccountInput = {
  readonly userId: string;
  readonly name: string;
  readonly initialBalance: number;
  readonly type: BankAccountType;
  readonly color: string;
};

type CreateBankAccountOutput = {
  readonly id: string;
  readonly name: string;
  readonly initialBalance: number;
  readonly type: BankAccountType;
  readonly color: string;
};

export class CreateBankAccountUseCase {
  constructor(private readonly repository: IBankAccountRepository) {}

  async execute(input: CreateBankAccountInput): Promise<CreateBankAccountOutput> {
    // business rules here
  }
}
```

## Domain Error Template

```typescript
// domain/errors/not-found.error.ts
export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

## Test Commands

```bash
pnpm test        # jest, no DB, no HTTP — pure unit tests
pnpm typecheck   # tsc --noEmit
```

## What Claude Gets Wrong Here

- Do NOT validate HTTP-level concerns (status codes, headers) here.
- Do NOT reference `userId` from a request object — it's just a `string` input parameter.
- Do NOT use Prisma-generated types in entity or use case signatures.
- Do NOT add optional properties where business rules require a value.
