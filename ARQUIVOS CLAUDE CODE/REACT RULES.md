# React Rules for Claude Code

> Baseado em Vercel React Best Practices — 57 regras, 8 categorias, priorizadas por impacto.

---

## 1. Component Structure

```typescript
type ComponentProps = {
  label: string;
  onPress?: () => void;
  isDisabled?: boolean;
};

export const Button = ({
  label,
  onPress,
  isDisabled = false,
}: Readonly<ComponentProps>) => {
  return (
    <button disabled={isDisabled} onClick={onPress}>
      {label}
    </button>
  );
};
```

**Regras obrigatórias:**
- Apenas **named exports** — nunca `export default`
- **Arrow functions** para componentes e hooks
- Defaults via **destructuring**, nunca dentro do corpo
- Máximo **300 linhas** por componente — extraia se ultrapassar
- **Um componente = uma responsabilidade** — lógica complexa vai em custom hooks
- **JSX estático** deve ser hoisted para fora do componente (evita recriação a cada render)

```typescript
// ✅ JSX estático hoisted
const EMPTY_STATE = <div className="empty">Nenhum item encontrado.</div>;

export const List = ({ items }: { items: string[] }) => {
  if (!items.length) return EMPTY_STATE;
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
};

// ❌ Recria o JSX a cada render
export const List = ({ items }: { items: string[] }) => {
  const empty = <div className="empty">Nenhum item encontrado.</div>;
  if (!items.length) return empty;
  ...
};
```

---

## 2. Eliminando Waterfalls (CRÍTICO)

Waterfalls são o maior killer de performance. Cada `await` sequencial desnecessário soma latência de rede.

### Paralelize operações independentes

```typescript
// ✅ Paralelo — ambas iniciam ao mesmo tempo
const [user, posts] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
]);

// ❌ Sequencial — posts só inicia após user completar
const user = await fetchUser(userId);
const posts = await fetchPosts(userId);
```

### Mova `await` para onde é realmente usado

```typescript
// ✅ O caminho que não precisa de `data` não espera
async function handler(type: 'fast' | 'slow') {
  const dataPromise = fetchData();
  if (type === 'fast') return { result: 'immediate' };
  const data = await dataPromise;
  return { result: data };
}

// ❌ Sempre aguarda, mesmo quando não precisa
async function handler(type: 'fast' | 'slow') {
  const data = await fetchData();
  if (type === 'fast') return { result: 'immediate' };
  return { result: data };
}
```

### Em API routes: inicie promises cedo, aguarde tarde

```typescript
// ✅
export async function POST(req: Request) {
  const logPromise = logRequest(req); // inicia sem await
  const data = await processRequest(req);
  await logPromise; // aguarda só no final
  return Response.json(data);
}
```

### Use Suspense para streaming

```typescript
// ✅
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SlowDataComponent />
    </Suspense>
  );
}
```

---

## 3. Bundle Size (CRÍTICO)

### Imports diretos — nunca barrel files

```typescript
// ✅
import { Button } from '@mui/material/Button';
import { ChevronRight } from 'lucide-react/icons/ChevronRight';

// ❌ Importa o barrel inteiro, aumenta bundle
import { Button } from '@mui/material';
import { ChevronRight } from 'lucide-react';
```

Bibliotecas afetadas: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `lodash`, `date-fns`, `rxjs`.

### Dynamic import para componentes pesados

```typescript
// ✅
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

// ❌
import HeavyChart from '@/components/Chart';
```

### Adie third-party libs (analytics, logging)

```typescript
// ✅ Só carrega após hidratação
useEffect(() => {
  import('@/lib/analytics').then(({ init }) => init());
}, []);
```

### Preload em hover/focus (perceived speed)

```typescript
const handleMouseEnter = () => {
  import('@/components/Modal'); // pré-carrega sem renderizar
};

return <button onMouseEnter={handleMouseEnter} onClick={openModal}>Abrir</button>;
```

---

## 4. Performance Server-Side (HIGH)

### `React.cache()` para deduplicação por request

```typescript
// ✅ — mesma request, mesmo resultado, sem re-fetch
import { cache } from 'react';

export const getUser = cache(async (id: string) => {
  return await db.user.findUnique({ where: { id } });
});
```

### LRU cache para dados entre requests

```typescript
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, User>({ max: 1000, ttl: 5 * 60 * 1000 });

export async function getUser(id: string): Promise<User | null> {
  const cached = cache.get(id);
  if (cached) return cached;
  const user = await db.user.findUnique({ where: { id } });
  if (user) cache.set(id, user);
  return user;
}
```

### Minimize serialização RSC → Client

```typescript
// ✅ Passe só o necessário
<ClientComponent userId={user.id} userName={user.name} />

// ❌ Serializa objeto inteiro (dados sensíveis + overhead)
<ClientComponent user={user} />
```

### Operações não-bloqueantes com `after()`

```typescript
import { after } from 'next/server';

export async function POST(req: Request) {
  const data = await processRequest(req);
  after(async () => {
    await logAnalytics(data); // não bloqueia a response
  });
  return Response.json(data);
}
```

---

## 5. Re-render Optimization (MEDIUM)

### Derive estado durante render — não em effects

```typescript
// ✅ Derivado direto no render
export const UserCard = ({ users, activeId }: Props) => {
  const activeUser = users.find(u => u.id === activeId); // derivado, sem estado extra
  return <div>{activeUser?.name}</div>;
};

// ❌ Effect desnecessário cria re-render extra
export const UserCard = ({ users, activeId }: Props) => {
  const [activeUser, setActiveUser] = useState<User>();
  useEffect(() => {
    setActiveUser(users.find(u => u.id === activeId));
  }, [users, activeId]);
  return <div>{activeUser?.name}</div>;
};
```

### `useState` lazy initialization para valores custosos

```typescript
// ✅ Função só executa uma vez
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('data') || '{}'));

// ❌ Parseia a cada render
const [data, setData] = useState(JSON.parse(localStorage.getItem('data') || '{}'));
```

### `setState` funcional para callbacks estáveis

```typescript
// ✅ — não precisa de `count` como dependência
const increment = useCallback(() => {
  setCount(prev => prev + 1);
}, []); // dep array vazio é válido

// ❌ — `count` muda, `increment` é recriado toda vez
const increment = useCallback(() => {
  setCount(count + 1);
}, [count]);
```

### Dependências primitivas em effects

```typescript
// ✅
useEffect(() => { fetch(`/api/user/${userId}`); }, [userId]);

// ❌ Objeto muda referência a cada render
useEffect(() => { fetch(`/api/user/${user.id}`); }, [user]);
```

### Não subscreva estado usado só em callbacks

```typescript
// ✅ Usa ref — não causa re-render
const countRef = useRef(count);
useEffect(() => { countRef.current = count; }, [count]);
const handleClick = useCallback(() => {
  console.log(countRef.current);
}, []);

// ❌ Subscreve count causando re-render desnecessário
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
```

### Props não-primitivas: hoist defaults

```typescript
// ✅ Referência estável
const DEFAULT_STYLE = { color: 'red' };
export const Box = ({ style = DEFAULT_STYLE }: Props) => <div style={style} />;

// ❌ Novo objeto a cada render do pai
export const Box = ({ style = { color: 'red' } }: Props) => <div style={style} />;
```

### `startTransition` para atualizações não urgentes

```typescript
import { startTransition } from 'react';

const handleSearch = (query: string) => {
  startTransition(() => {
    setResults(heavyFilter(query));
  });
};
```

### `useRef` para valores transientes de alta frequência

```typescript
// ✅ Posição do mouse não precisa causar re-render
const positionRef = useRef({ x: 0, y: 0 });
window.addEventListener('mousemove', e => {
  positionRef.current = { x: e.clientX, y: e.clientY };
});
```

---

## 6. Rendering Performance (MEDIUM)

### Listas longas com `content-visibility`

```css
/* ✅ Pula rendering de itens fora da viewport */
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### Condicionais: ternário em vez de `&&`

```typescript
// ✅
{count > 0 ? <Badge count={count} /> : null}

// ❌ Renderiza "0" no DOM se count for 0
{count && <Badge count={count} />}
```

### `useTransition` para loading state

```typescript
// ✅
const [isPending, startTransition] = useTransition();
const navigate = () => startTransition(() => router.push('/dashboard'));
return <button onClick={navigate}>{isPending ? 'Carregando...' : 'Ir'}</button>;
```

### Suprima mismatch esperado de hidratação

```typescript
// ✅ Só quando o mismatch é intencional e conhecido
<div suppressHydrationWarning>{new Date().toLocaleDateString()}</div>
```

---

## 7. Hooks Patterns

### Retorno `as const` (tuplas e objetos tipados)

```typescript
// ✅
const useToggle = (initial = false) => {
  const [on, setOn] = useState(initial);
  const toggle = useCallback(() => setOn(p => !p), []);
  return [on, toggle] as const; // [boolean, () => void]
};

// ✅ Objeto com as const
const useUser = (id: string) => {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // ... fetch logic
  return { data, loading, error } as const;
};
```

### `useCallback` e `useMemo` em hooks genéricos/reutilizáveis

```typescript
// ✅ Hook reutilizável — sempre memoize callbacks e valores computados
const useSearch = <TItem>(items: TItem[], predicate: (item: TItem, q: string) => boolean) => {
  const [query, setQuery] = useState('');
  
  const results = useMemo(
    () => items.filter(item => predicate(item, query)),
    [items, query, predicate]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return { results, query, handleChange } as const;
};
```

- **Hooks genéricos/reutilizáveis**: `useCallback` + `useMemo` obrigatórios
- **Hooks específicos de um componente**: avalie caso a caso

### Lógica de interação em event handlers, não effects

```typescript
// ✅
const handleSubmit = async () => {
  setLoading(true);
  await submitForm(data);
  setLoading(false);
  router.push('/success');
};

// ❌ Effect desnecessário para orquestrar ação
useEffect(() => {
  if (submitted) {
    setLoading(true);
    submitForm(data).then(() => {
      setLoading(false);
      router.push('/success');
    });
  }
}, [submitted]);
```

---

## 8. JavaScript Performance (LOW-MEDIUM)

### Map/Set para lookups O(1)

```typescript
// ✅ O(1) lookup
const userMap = new Map(users.map(u => [u.id, u]));
const user = userMap.get(targetId);

// ❌ O(n) por lookup
const user = users.find(u => u.id === targetId);
```

### Combine loops múltiplos em um único passo

```typescript
// ✅ Uma passagem
const { active, total } = users.reduce(
  (acc, user) => ({
    active: acc.active + (user.active ? 1 : 0),
    total: acc.total + user.score,
  }),
  { active: 0, total: 0 }
);

// ❌ Duas passagens sobre o mesmo array
const activeCount = users.filter(u => u.active).length;
const totalScore = users.reduce((sum, u) => sum + u.score, 0);
```

### Cache resultados de funções custosas

```typescript
// ✅ Module-level cache
const parseCache = new Map<string, Config>();

export function parseConfig(raw: string): Config {
  if (parseCache.has(raw)) return parseCache.get(raw)!;
  const parsed = expensiveParse(raw);
  parseCache.set(raw, parsed);
  return parsed;
}
```

### Hoist RegExp fora de loops

```typescript
// ✅
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validEmails = emails.filter(e => EMAIL_RE.test(e));

// ❌ Cria nova RegExp a cada iteração
const validEmails = emails.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
```

### Early return

```typescript
// ✅
function process(user: User | null): string {
  if (!user) return 'anonymous';
  if (!user.isActive) return 'inactive';
  return user.name;
}
```

---

## 9. Client-Side Data Fetching (MEDIUM-HIGH)

### SWR para deduplicação automática

```typescript
// ✅ Múltiplos componentes chamando o mesmo key = 1 request
import useSWR from 'swr';

const { data, error, isLoading } = useSWR(`/api/user/${id}`, fetcher);
```

### Event listeners passivos para scroll/touch

```typescript
// ✅ Não bloqueia o thread principal
window.addEventListener('scroll', handler, { passive: true });
```

---

## 10. Formulários

- Divida campos em **componentes separados** — evita re-render do form inteiro
- Use **`useReducer`** para agrupar estado relacionado de forms complexos

```typescript
type FormState = { name: string; email: string; errors: Record<string, string> };
type FormAction =
  | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'errors'>; value: string }
  | { type: 'SET_ERROR'; field: string; message: string }
  | { type: 'RESET' };

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'SET_FIELD': return { ...state, [action.field]: action.value };
    case 'SET_ERROR': return { ...state, errors: { ...state.errors, [action.field]: action.message } };
    case 'RESET': return initialState;
  }
};
```

---

## 11. Padrões Avançados

Aplique quando a complexidade justificar:

### Compound Components (evita prop drilling)

```typescript
// ✅
<Select>
  <Select.Trigger />
  <Select.Options>
    <Select.Option value="a">Opção A</Select.Option>
  </Select.Options>
</Select>
```

### `useLatest` para callbacks com closure stale

```typescript
// ✅ Callback sempre usa o valor mais recente sem ser dependência
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useLayoutEffect(() => { ref.current = value; });
  return ref;
}
```

### Inicialize app apenas uma vez

```typescript
// ✅ Fora do componente — roda uma vez na importação
initSentry();
initAnalytics();

export default function App() { ... }
```

---

## Quick Reference

| ✅ Faça | ❌ Evite |
|---|---|
| `Promise.all()` para operações independentes | `await` sequencial desnecessário |
| Import direto `@mui/material/Button` | Barrel imports `@mui/material` |
| `React.cache()` para dedup por request | Fetch duplicado na mesma request |
| Derivar estado no render | `useEffect` para sincronizar estado derivado |
| `setState(prev => ...)` funcional | `setState(count + 1)` com dep em closure |
| Defaults primitivos hoisted | Default objects/arrays inline em props |
| `{ passive: true }` em scroll listeners | Event listeners bloqueantes |
| Ternário `condition ? <A /> : null` | `condition && <A />` com valores falsy |
| Early return explícito | Lógica aninhada desnecessária |
| `new Map()` para lookups repetidos | `.find()` em loops |
| Named exports apenas | `export default` |
| Hook genérico → sempre memoize | `useMemo` cego em hooks específicos |
