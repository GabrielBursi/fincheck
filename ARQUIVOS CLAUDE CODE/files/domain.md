# Fincheck — Domain Model

## Entities

### User
Core aggregate root. Owns everything.
- `id: string (UUID)`
- `name: string`
- `email: string` — unique
- `password: string` — hashed

### BankAccount
Represents a financial account (checking, investment, cash).
- `id`, `userId`, `name`, `initialBalance: number`, `type: BankAccountType`, `color: string`
- Current balance = `initialBalance` + sum of INCOME transactions − sum of EXPENSE transactions
- Can be shared with other users via `BankAccountShare`

### Transaction
A financial movement linked to a bank account.
- `id`, `userId`, `bankAccountId`, `categoryId?`, `name`, `value: number`, `date: Date`, `type: TransactionType`
- `categoryId` is nullable — a transaction can be uncategorized

### Category
User-defined label for grouping transactions.
- `id`, `userId`, `name`, `icon`, `type: TransactionType`
- Type is either INCOME or EXPENSE — a category only applies to one direction

### BankAccountShare
Represents a sharing invitation for a bank account.
- `id`, `bankAccountId`, `userId?`, `email`, `permission: BankAccountPermission`
- `userId` is null until the invitee registers

### Goal
A savings or financial target.
- `id`, `userId`, `name`, `targetValue: number`, `currentValue: number`, `deadline?: Date`
- Can be associated with multiple bank accounts

## Value Objects (to implement in `core/domain/value-objects/`)

| Value Object | Rules |
|---|---|
| `Money` | Non-negative, has currency |
| `Email` | Valid format |
| `BankAccountType` | `CHECKING \| INVESTMENT \| CASH` |
| `TransactionType` | `INCOME \| EXPENSE` |
| `BankAccountPermission` | `VIEW \| EDIT` |

Use const objects + union types (no `enum`):
```typescript
export const BankAccountType = {
  CHECKING: 'CHECKING',
  INVESTMENT: 'INVESTMENT',
  CASH: 'CASH',
} as const;
export type BankAccountType = typeof BankAccountType[keyof typeof BankAccountType];
```

## Repository Interfaces (to define in `core/domain/repositories/`)

- `IUserRepository` — `findById`, `findByEmail`, `save`
- `IBankAccountRepository` — `findAllByUserId`, `findById`, `save`, `delete`
- `ITransactionRepository` — `findAllByUserId` (with filters: month, year, bankAccountId, type), `findById`, `save`, `delete`
- `ICategoryRepository` — `findAllByUserId`, `findById`, `save`, `delete`
- `IBankAccountShareRepository` — `findAllByBankAccountId`, `save`, `delete`
- `IGoalRepository` — `findAllByUserId`, `findById`, `save`, `delete`

## Domain Errors (to define in `core/domain/errors/`)

```typescript
export class UnauthorizedError extends Error { ... }
export class NotFoundError extends Error { ... }   // Entity not found or not owned by user
export class ConflictError extends Error { ... }   // e.g. email already in use
export class InvalidAmountError extends Error { ... }
```

NestJS services map these → appropriate HTTP exceptions (404, 403, 409, 400).

## Use Cases per Domain

### Auth
- `SignUpUseCase` — validate email uniqueness, hash password, create user
- `SignInUseCase` — validate credentials, return JWT

### BankAccounts
- `CreateBankAccountUseCase`
- `ListBankAccountsUseCase` — includes computed current balance
- `UpdateBankAccountUseCase` — validate ownership
- `DeleteBankAccountUseCase` — validate ownership
- `ShareBankAccountUseCase` — validate ownership + permission level

### Transactions
- `CreateTransactionUseCase`
- `ListTransactionsUseCase` — filters: month, year, bankAccountId?, type?
- `UpdateTransactionUseCase` — validate ownership
- `DeleteTransactionUseCase` — validate ownership

### Categories
- `ListCategoriesUseCase`

### Goals
- `CreateGoalUseCase`
- `ListGoalsUseCase`
- `GetGoalUseCase`
- `UpdateGoalUseCase` — validate ownership
- `DeleteGoalUseCase` — validate ownership

### Users
- `GetMeUseCase` — return current user profile (no password)
