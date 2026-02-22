# new-use-case

Creates a new use case in `packages/core/application/use-cases/`.

## Instructions

1. Read `docs/domain.md` to understand the domain model.
2. Read `packages/core/CLAUDE.md` for use case conventions.
3. Determine which domain directory to place the use case in.
4. Create the use case file following the RO-RO pattern (one input type, one output type).
5. Define or reuse a domain error if the use case can fail for business reasons.
6. Create a corresponding unit test file in the same directory with `.spec.ts` suffix.

## Usage

```
/new-use-case <domain> <VerbNoun>
```

Example: `/new-use-case bank-accounts UpdateBankAccount`

Creates:

- `packages/core/application/use-cases/bank-accounts/update-bank-account.use-case.ts`
- `packages/core/application/use-cases/bank-accounts/update-bank-account.use-case.spec.ts`

## Template

```typescript
// <verb>-<noun>.use-case.ts
import type { I<Entity>Repository } from '../../../domain/repositories/i-<entity>-repository';
import { NotFoundError } from '../../../domain/errors/not-found.error';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error';

type <VerbNoun>Input = {
  readonly userId: string;
  // ... other inputs
};

type <VerbNoun>Output = {
  // ... output fields
};

export class <VerbNoun>UseCase {
  constructor(private readonly repository: I<Entity>Repository) {}

  async execute(input: <VerbNoun>Input): Promise<<VerbNoun>Output> {
    // 1. Guard clauses / early returns
    // 2. Business logic
    // 3. Persist and return
  }
}
```
