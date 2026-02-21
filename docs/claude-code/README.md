# Claude Code Setup - Fincheck

Este diretório contém a documentação e configuração para otimizar o uso do Claude Code neste projeto.

## 📂 Estrutura de Arquivos

### Configuração Principal
- **`.claude-code.json`** (raiz do projeto) - Arquivo de configuração do Claude Code com contextos, regras e estrutura do monorepo

### Documentação da Arquitetura
- **`CLAUDE.md`** - Visão geral do projeto, estrutura do monorepo e comandos essenciais
- **`architecture.md`** - Decisões arquitetônicas, layers, e fluxo de dependências
- **`domain.md`** - Modelo de domínio, entidades e relacionamentos

### Modelos de Artefatos
- **`new-api-module.md`** - Template para criar um novo módulo NestJS
- **`new-use-case.md`** - Template para criar um novo use case no core
- **`review.md`** - Checklist de code review

### Regras Gerais (em `/docs/`)
- **`CLEAN_CODE_RULES.md`** - Princípios de código limpo (framework-agnóstico)
- **`TYPESCRIPT_RULES.md`** - Padrões específicos de TypeScript
- **`NEST_RULES.md`** - Padrões específicos de NestJS
- **`REACT_RULES.md`** - Padrões específicos de React

## 🎯 Como Usar

### 1. **Ao Iniciar um Novo Trabalho**
Peça ao Claude Code para revisar:
```
"Revise a configuration em .claude-code.json e a documentação em docs/claude-code/ para entender a arquitetura do Fincheck"
```

### 2. **Ao Criar um Novo Módulo NestJS**
```
"Use docs/claude-code/new-api-module.md como template para criar [NomeModulo]Module"
```

### 3. **Ao Criar um Novo Use Case**
```
"Use docs/claude-code/new-use-case.md como template para criar [NomeUseCase]"
```

### 4. **Durante Code Review**
```
"Use docs/claude-code/review.md para fazer code review deste PR"
```

## ⚙️ Estrutura do Projeto

```
fincheck/                          # Monorepo root
├── apps/
│   ├── api/                      # NestJS HTTP adapter
│   │   └── src/
│   │       ├── core/             # Filtros, guards, interceptors globais
│   │       ├── shared/           # Decorators, pipes, utilidades
│   │       ├── database/         # Prisma, repository implementations
│   │       └── modules/          # Controllers e wiring por domínio
│   └── web/                      # React frontend (futuro)
│
├── packages/
│   └── core/                     # Framework-agnostic domain + application
│       ├── domain/               # Entities, value objects, errors, repository interfaces
│       └── application/          # Use cases (1 arquivo = 1 use case)
│
├── docs/
│   ├── claude-code/              # Configuração Claude Code & templates
│   ├── CLEAN_CODE_RULES.md
│   ├── TYPESCRIPT_RULES.md
│   ├── NEST_RULES.md
│   └── REACT_RULES.md
│
└── .claude-code.json             # Configuração central
```

## 🚀 Non-Negotiable Rules

### Gerais
- ✅ **Zero `any`** — use `unknown` e narrow explicitamente
- ✅ **Sem `export default`** em lugar nenhum
- ✅ Nomes: `kebab-case` (arquivos), `PascalCase` (classes), `camelCase` (funções)
- ✅ Max 20 linhas por função, max 300 por arquivo
- ✅ JSDoc em todas as APIs públicas

### Arquitetura (CRÍTICO)
- ✅ Dependência: `apps` → `packages/core`. **Nunca** `core` → `apps`
- ✅ `packages/core` tem **zero imports NestJS**
- ✅ Lógica de negócio em `packages/core/application/`, não em `apps/api/src/modules/`
- ✅ Repository interfaces em `core/domain/`, implementações em `apps/api/`

### Testes
- ✅ AAA para unit tests, Given-When-Then para e2e
- ✅ Variáveis: `inputX`, `mockX`, `actualX`, `expectedX`
- ✅ Sem lógica em testes (`if`, `for`, `switch`)

## 📋 Checklist Antes de Comitar

```
✓ pnpm typecheck (sem erros)
✓ pnpm lint (sem warnings desnecessários)
✓ pnpm test (todos os testes passando)
✓ Nomes revelam intenção (Clean Code Rules)
✓ Respeitar direção de dependência
✓ Sem `any` types, sem `export default`
✓ Arquivos < 300 linhas, funções < 20 linhas
✓ JSDoc em APIs públicas
```

## 🔗 Referências Rápidas

| Preciso | Vejo em |
|---------|---------|
| Criar novo módulo NestJS | `docs/claude-code/new-api-module.md` |
| Criar novo use case | `docs/claude-code/new-use-case.md` |
| Entender a arquitetura | `docs/claude-code/architecture.md` |
| Entender o domínio | `docs/claude-code/domain.md` |
| Fazer code review | `docs/claude-code/review.md` |
| Rules de código limpo | `docs/CLEAN_CODE_RULES.md` |
| Rules de TypeScript | `docs/TYPESCRIPT_RULES.md` |
| Rules de NestJS | `docs/NEST_RULES.md` |
| Rules de React | `docs/REACT_RULES.md` |

---

**Criado em**: 21/02/2025
**Estrutura**: Monorepo com DDD + Clean Architecture + Hexagonal Architecture
