# apps/web — React Frontend

Read `../../docs/domain.md` for domain concepts before building features.

## Stack

- **React** with **TypeScript** (strict mode)
- **TanStack Start** + **TanStack Router** — file-based routing
- **TanStack Query** — server state, caching, mutations
- **Zustand** — client-only UI state (modals, filters, local preferences)
- **TailwindCSS** — styling (utility classes only, no custom CSS unless unavoidable)
- **React Aria** — accessible primitives for UI components
- **Axios** — HTTP client (base instance configured in `src/lib/api.ts`)
- **Vite** — build tool

## Directory Structure

```
src/
├── lib/
│   ├── api.ts              # Axios instance with JWT interceptor
│   └── query-client.ts     # TanStack Query client config
├── services/               # API call functions (one file per domain)
│   ├── auth.service.ts
│   ├── bank-accounts.service.ts
│   ├── transactions.service.ts
│   ├── categories.service.ts
│   └── goals.service.ts
├── hooks/                  # Custom hooks (one file per concern)
│   ├── use-bank-accounts.ts  # TanStack Query wrappers
│   ├── use-transactions.ts
│   └── ...
├── stores/                 # Zustand stores
│   └── use-dashboard-filters.store.ts
├── components/
│   ├── ui/                 # Generic design system components (Button, Input, Modal, etc.)
│   └── [feature]/          # Feature-specific components
├── routes/                 # TanStack Router file-based routes
│   ├── _auth/              # Protected routes
│   └── _public/            # Public routes (login, signup)
└── types/
    └── api.types.ts        # Mirror of API response types
```

## Data Fetching Rules

- Use **TanStack Query** for all server state — no `useState` + `useEffect` for fetching.
- Query keys are defined as constants in each service file.
- Mutations always `invalidateQueries` on success for the affected resource.
- Use `Promise.all` to parallelize independent queries — no sequential waterfalls.

```typescript
// ✅
const [{ data: accounts }, { data: categories }] = await Promise.all([
  queryClient.fetchQuery(bankAccountsQuery()),
  queryClient.fetchQuery(categoriesQuery(userId)),
]);
```

## Component Rules

- **Named exports only** — no `export default`.
- **Arrow functions** for all components and hooks.
- Props typed as `type ComponentProps = { ... }` — use `Readonly<ComponentProps>`.
- Default prop values via destructuring — never inside the function body.
- Max 300 lines per component — extract to hooks or sub-components if larger.
- Static JSX (empty states, icons) hoisted outside the component.

## State Management

- **Server state** → TanStack Query (fetching, caching, mutations).
- **URL state** → TanStack Router search params (filters, pagination).
- **UI-only state** → Zustand (modal open/close, selected tab).
- **Form state** → controlled components or `useReducer` for complex forms.
- No `useEffect` to sync derived state — derive during render.

## Styling

- Tailwind utility classes only.
- No inline `style` objects except for truly dynamic values (e.g., chart colors).
- Color scheme tokens defined in `tailwind.config.ts` — use semantic names.

## Auth

- JWT stored in memory (Zustand) + `httpOnly` cookie (set by API).
- Axios interceptor attaches `Authorization: Bearer <token>` header.
- On 401, clear auth store and redirect to `/login`.

## Test Commands

```bash
pnpm test          # vitest unit tests
pnpm test:ui       # vitest with UI
pnpm build         # type-check + build
pnpm typecheck     # tsc --noEmit
pnpm lint          # eslint
```

## What Claude Gets Wrong Here

- Do NOT use `export default` — always named exports.
- Do NOT fetch data with `useState` + `useEffect` — use TanStack Query.
- Do NOT use `condition && <Component />` with non-boolean left side — use ternary.
- Do NOT import from barrel files (`lucide-react`, `@radix-ui`) — import from direct paths.
- Do NOT put API response types in component files — they go in `src/types/api.types.ts`.
- Do NOT store server state in Zustand — only UI state.
