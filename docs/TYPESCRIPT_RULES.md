# TypeScript Rules for Claude Code

## 1. Type Safety

**Never use `any`.** Use `unknown` for dynamic types and narrow explicitly.

```typescript
// ✅
function parse(input: unknown): string {
  if (typeof input !== 'string') throw new Error('Expected string');
  return input;
}

// ❌
function parse(input: any): string {
  return input;
}
```

**Avoid type assertions (`as`).** Prefer type guards.

```typescript
// ✅
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'id' in val;
}

// ❌
const user = response as User;
```

**Narrowing tools:** `typeof`, `instanceof`, discriminated unions, custom type guards.

---

## 2. Generics

Use **descriptive names** with defaults and constraints.

```typescript
// ✅
function getData<TData = unknown>(id: string): Promise<TData>;
function merge<TBase extends object, TOverride extends Partial<TBase>>(
  base: TBase,
  override: TOverride,
): TBase & TOverride;

// ❌
function getData<T>(id: string): Promise<T>;
```

**Conventions:**

- Names: `TData`, `TResponse`, `TItem`, `TKey`, `TValue`
- Always add `extends` constraints when type must satisfy a shape
- Provide defaults (`= unknown`, `= never`) when callers often omit the param

---

## 3. Type Inference

Let TypeScript infer — only annotate when needed.

```typescript
// ✅ inferred
const count = 0;
const items = ['a', 'b'];
const double = (x: number) => x * 2;

// ✅ annotate when inference is wrong or ambiguous
const cache: Map<string, User> = new Map();

// ❌ redundant
const count: number = 0;
```

Use `as const` for tuple/object hook returns to preserve literal types:

```typescript
// ✅
function useToggle(initial: boolean) {
  const [on, setOn] = useState(initial);
  return [on, setOn] as const; // [boolean, Dispatch<SetStateAction<boolean>>]
}
```

---

## 4. Interfaces vs Types

- **`interface`** → object shapes, extendable APIs, class contracts
- **`type`** → unions, intersections, mapped/conditional types, primitives

```typescript
// ✅
interface Repository<TEntity> {
  findById(id: string): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
}

type Status = 'idle' | 'loading' | 'success' | 'error';
type Nullable<T> = T | null;
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

---

## 5. Null & Undefined

Enable `strictNullChecks`. Prefer `undefined` over `null` for optional values.

```typescript
// ✅
interface Config {
  timeout?: number; // optional — undefined
  retries: number | null; // explicit null means "disabled"
}

// ✅ nullish coalescing / optional chaining
const label = user?.profile?.displayName ?? 'Anonymous';

// ❌ non-null assertion (hides bugs)
const name = user!.name;
```

---

## 6. Discriminated Unions

Prefer over optional fields for mutually exclusive states.

```typescript
// ✅
type RequestState<TData> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TData }
  | { status: 'error'; error: Error };

function render(state: RequestState<User>) {
  switch (state.status) {
    case 'success':
      return state.data.name; // fully narrowed
    case 'error':
      return state.error.message;
  }
}

// ❌ stringly-typed optional bag
interface RequestState {
  loading?: boolean;
  data?: User;
  error?: Error;
}
```

---

## 7. Utility Types

Use built-ins before rolling your own.

| Utility          | Use                   |
| ---------------- | --------------------- |
| `Partial<T>`     | All props optional    |
| `Required<T>`    | All props required    |
| `Readonly<T>`    | Immutable shape       |
| `Pick<T, K>`     | Subset of props       |
| `Omit<T, K>`     | Exclude props         |
| `Record<K, V>`   | Typed dictionary      |
| `ReturnType<F>`  | Infer return type     |
| `Parameters<F>`  | Infer param tuple     |
| `Awaited<T>`     | Unwrap Promise        |
| `NonNullable<T>` | Remove null/undefined |

```typescript
// ✅
type CreateUserDTO = Omit<User, 'id' | 'createdAt'>;
type UserPatch = Partial<Pick<User, 'name' | 'email'>>;
type ApiHandler = (req: Request) => Promise<Response>;
type HandlerParams = Parameters<ApiHandler>;
```

---

## 8. Functions

Explicit return types on public/exported functions. Infer for private/internal.

```typescript
// ✅ exported — explicit return type documents the contract
export function formatDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale);
}

// ✅ internal — infer
const add = (a: number, b: number) => a + b;

// ✅ overloads for multiple signatures
function coerce(val: string): number;
function coerce(val: number): string;
function coerce(val: string | number): string | number {
  return typeof val === 'string' ? Number(val) : String(val);
}
```

---

## 9. Enums

Prefer **const objects + union types** over `enum`.

```typescript
// ✅
const Direction = { Up: 'UP', Down: 'DOWN', Left: 'LEFT', Right: 'RIGHT' } as const;
type Direction = (typeof Direction)[keyof typeof Direction]; // 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// ❌ — emits runtime code, numeric enums are unsafe
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

---

## 10. Error Handling

Type errors explicitly; never swallow them silently.

```typescript
// ✅
class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

async function fetchUser(id: string): Promise<User> {
  try {
    const res = await api.get(`/users/${id}`);
    return res.data as User; // validated below in practice
  } catch (err) {
    throw new AppError('Failed to fetch user', 'USER_FETCH_ERROR', err);
  }
}
```

---

## 11. Strict tsconfig Baseline

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

---

## Quick Reference: Do / Don't

| ✅ Do                               | ❌ Don't                            |
| ----------------------------------- | ----------------------------------- |
| `unknown` for dynamic input         | `any` anywhere                      |
| Type guards for narrowing           | `as` type assertions                |
| Descriptive generic names (`TData`) | Single-letter generics (`T`)        |
| `interface` for object shapes       | `type` for extensible object shapes |
| `undefined` for optional values     | `null` as default missing value     |
| `as const` on literal returns       | Mutable inferred tuples             |
| `const` enum alternatives           | `enum` (runtime overhead)           |
| Explicit return types on exports    | Implicit any return types           |
| Discriminated unions for state      | Optional boolean flag bags          |
