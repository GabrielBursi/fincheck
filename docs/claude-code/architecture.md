# Fincheck — Architecture

## Philosophy

DDD + Clean Architecture + Hexagonal Architecture.

- **`packages/core`** is the hexagon. It owns all business rules and defines ports (repository interfaces, use case interfaces).
- **`apps/api`** is an adapter. NestJS wires dependency injection, maps HTTP ↔ use cases, and implements repository ports using Prisma.
- **`apps/web`** is an adapter. React consumes the API and renders UI.

The domain doesn't know the web exists. The web doesn't know Prisma exists.

## Layer Map

```
packages/core/
├── domain/
│   ├── entities/          # Pure TS classes — no decorators, no ORM annotations
│   ├── value-objects/     # Immutable, self-validating (Money, Email, etc.)
│   ├── errors/            # Domain errors (extend Error, typed)
│   └── repositories/      # Interfaces only — IUserRepository, IBankAccountRepository, etc.
│
└── application/
    └── use-cases/
        ├── auth/          # SignUpUseCase, SignInUseCase
        ├── bank-accounts/ # CreateBankAccountUseCase, etc.
        ├── transactions/  # CreateTransactionUseCase, etc.
        ├── categories/    # ListCategoriesUseCase
        └── goals/         # CreateGoalUseCase, etc.

apps/api/
├── src/
│   ├── core/              # Global NestJS artefacts (filters, guards, interceptors)
│   ├── shared/            # Decorators, pipes, utils used across modules
│   ├── database/          # PrismaService, repository implementations
│   └── modules/
│       ├── auth/          # AuthModule — controller, NestJS wiring for auth use cases
│       ├── bank-accounts/ # BankAccountsModule
│       ├── transactions/  # TransactionsModule
│       ├── categories/    # CategoriesModule
│       ├── goals/         # GoalsModule
│       └── users/         # UsersModule
```

## Dependency Inversion in Practice

```
// ✅ core/domain/repositories/i-user-repository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// ✅ apps/api/src/database/repositories/prisma-user.repository.ts
// Implements IUserRepository using PrismaService

// ✅ apps/api/src/modules/auth/auth.module.ts
// Binds IUserRepository token → PrismaUserRepository via NestJS DI
```

## Use Case Contract

Every use case:

1. Receives a single input object (RO-RO pattern).
2. Returns a single output object or `void`.
3. Throws a domain error (defined in `core/domain/errors/`) for business violations.
4. Has no NestJS imports — framework-agnostic.

```typescript
// core/application/use-cases/bank-accounts/create-bank-account.use-case.ts
export class CreateBankAccountUseCase {
  constructor(private readonly bankAccountRepository: IBankAccountRepository) {}

  async execute(input: CreateBankAccountInput): Promise<CreateBankAccountOutput> { ... }
}
```

NestJS services in `apps/api/` are thin wrappers that:

- Call the use case `execute()`.
- Translate domain errors → HTTP exceptions.
- Map output types to API response types.

## Authentication Flow

- JWT strategy in `apps/api/src/core/guards/`.
- `@ActiveUserId()` decorator extracts `userId` from the JWT payload.
- `@IsPublic()` decorator bypasses JWT guard on `auth/signin` and `auth/signup`.

## Error Handling Contract

| Layer                    | Error type                        | Handler               |
| ------------------------ | --------------------------------- | --------------------- |
| `core/domain`            | Domain error classes              | Thrown by use cases   |
| `apps/api` services      | Translate to Nest HTTP exceptions | NestJS                |
| `apps/api` global filter | `HttpExceptionFilter`             | Formats JSON response |

## Shared Account (BankAccountShare)

A bank account can be shared with another user via email. Permissions are `VIEW` or `EDIT`.

- Share invite stores email even if the invitee is not yet a user.
- When the invitee signs up, the share record links to their `userId`.

## Key Invariants

- A user always owns their transactions, categories, goals, and bank accounts.
- `categoryId` on a transaction is nullable (uncategorized).
- `Goal` can optionally be linked to specific bank accounts.
- `BankAccountShare.userId` is nullable until the invitee registers.
