# review

Runs a structured code review against fincheck's architecture and style rules.

## Instructions

Review the files in the current git diff (or the files I specify) against these checklists:

### Architecture
- [ ] No business logic in `apps/api/` modules — all logic is in `packages/core/` use cases
- [ ] No Prisma or NestJS imports in `packages/core/`
- [ ] Domain errors from `core/domain/errors/` are translated to HTTP exceptions in the API layer
- [ ] Repository interfaces are defined in `core/domain/repositories/` — no concrete DB calls in use cases

### TypeScript
- [ ] Zero `any` — `unknown` is used for dynamic types
- [ ] No type assertions (`as`) — type guards used instead
- [ ] No `export default` — named exports only
- [ ] No `enum` — `const` objects + union types used
- [ ] Explicit return types on all exported functions

### Clean Code
- [ ] No function exceeds 20 lines
- [ ] No file exceeds 300 lines
- [ ] Guard clauses / early returns — no nested `if` pyramids
- [ ] No commented-out code
- [ ] Names reveal intention — no single letters, no `data`/`info`/`temp`

### Tests
- [ ] New use cases have a `.spec.ts` file
- [ ] Tests follow AAA pattern with `inputX`, `mockX`, `actualX`, `expectedX` variable names
- [ ] No logic (`if`, `for`) inside test bodies
- [ ] New controllers have a `GET admin/test` smoke test

### NestJS (api only)
- [ ] DTOs use `class-validator` decorators
- [ ] Response types are plain TS types — no entities or Prisma models exposed
- [ ] `@ApiProperty` on all DTO fields for Swagger

### React (web only)
- [ ] No `export default`
- [ ] No `useState` + `useEffect` for data fetching — TanStack Query used
- [ ] No barrel imports from `lucide-react` or similar libs
- [ ] Ternary used instead of `&&` for JSX conditionals

## Usage

```
/review
/review src/modules/transactions/
```
