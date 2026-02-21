# Documentação - Fincheck

Bem-vindo à documentação do Fincheck. Este diretório contém toda a documentação arquitetural, padrões de código e configuração do Claude Code.

## 📚 Índice de Documentação

### 🤖 **Configuração Claude Code**
- 📖 [**docs/claude-code/README.md**](./claude-code/README.md) - **LEIA PRIMEIRO** - Guia completo de setup
- ⚙️ [`.claude-code.json`](../.claude-code.json) - Configuração central do projeto

### 🏗️ **Arquitetura do Projeto**
- 📋 [**claude-code/CLAUDE.md**](./claude-code/CLAUDE.md) - Visão geral, estrutura do monorepo e comandos
- 🛠️ [**claude-code/architecture.md**](./claude-code/architecture.md) - DDD + Clean Architecture + Hexagonal Architecture
- 🗺️ [**claude-code/domain.md**](./claude-code/domain.md) - Modelo de domínio e entidades

### 📝 **Regras e Padrões de Código**
- ✨ [**CLEAN_CODE_RULES.md**](./CLEAN_CODE_RULES.md) - Princípios de código limpo (framework-agnóstico)
- 🔷 [**TYPESCRIPT_RULES.md**](./TYPESCRIPT_RULES.md) - Padrões TypeScript
- 🪶 [**NEST_RULES.md**](./NEST_RULES.md) - Padrões NestJS
- ⚛️ [**REACT_RULES.md**](./REACT_RULES.md) - Padrões React

### 🎯 **Guias de Desenvolvimento**
- 🆕 [**claude-code/new-api-module.md**](./claude-code/new-api-module.md) - Template para novo módulo NestJS
- 🆕 [**claude-code/new-use-case.md**](./claude-code/new-use-case.md) - Template para novo use case
- 👁️ [**claude-code/review.md**](./claude-code/review.md) - Checklist de code review

---

## 🚀 Início Rápido

### 1️⃣ **Primeira Vez?**
1. Leia [claude-code/README.md](./claude-code/README.md)
2. Familiarize-se com [claude-code/architecture.md](./claude-code/architecture.md)
3. Entenda o domínio em [claude-code/domain.md](./claude-code/domain.md)

### 2️⃣ **Antes de Codificar**
- Revise [CLEAN_CODE_RULES.md](./CLEAN_CODE_RULES.md)
- Revise as regras da linguagem/framework que vai usar

### 3️⃣ **Criando Novas Features**
- Novo módulo NestJS? Use [claude-code/new-api-module.md](./claude-code/new-api-module.md)
- Novo use case? Use [claude-code/new-use-case.md](./claude-code/new-use-case.md)

### 4️⃣ **Antes de Fazer PR**
- Use a checklist em [claude-code/review.md](./claude-code/review.md)
- Rode `pnpm typecheck && pnpm lint && pnpm test`

---

## 📂 Estrutura do Projeto

```
fincheck/                              # Monorepo root
│
├── apps/                              # Adapters
│   ├── api/                          # NestJS HTTP adapter
│   │   └── src/
│   │       ├── core/                 # Filtros, guards, interceptors globais
│   │       ├── shared/               # Decorators, pipes, utilidades
│   │       ├── database/             # Prisma + repository implementations
│   │       └── modules/              # Controllers e DI wiring por domínio
│   │
│   └── web/                          # React frontend (futuro)
│
├── packages/                          # Núcleo compartilhado
│   └── core/                         # Domain layer + Application layer
│       ├── domain/                   # Entities, value objects, errors, repository interfaces
│       │   ├── entities/
│       │   ├── value-objects/
│       │   ├── errors/
│       │   └── repositories/         # Interfaces (implementadas em apps/api)
│       │
│       └── application/              # Use cases
│           └── use-cases/
│               ├── auth/
│               ├── bank-accounts/
│               ├── transactions/
│               ├── categories/
│               └── goals/
│
├── docs/                              # Documentação 📍 Você está aqui
│   ├── claude-code/                  # Configuração Claude Code
│   ├── CLEAN_CODE_RULES.md
│   ├── TYPESCRIPT_RULES.md
│   ├── NEST_RULES.md
│   ├── REACT_RULES.md
│   └── README.md (este arquivo)
│
└── .claude-code.json                  # Configuração do Claude Code
```

---

## ⚡ Arquitetura em Uma Linha

**DDD (Domain-Driven Design) + Clean Architecture + Hexagonal Architecture**

- **packages/core** = O domínio (hexágono). Define regras de negócio e portas (interfaces).
- **apps/api** = Adaptador NestJS. Implementa as portas, wira DI, mapeia HTTP ↔ use cases.
- **apps/web** = Adaptador React. Consome a API, renderiza UI.

**Regra de Ouro**: `apps → packages/core`. Nunca `core → apps`.

---

## ✅ Non-Negotiable Rules

### Universal
- ✅ Zero `any` — use `unknown`
- ✅ Sem `export default`
- ✅ Nomes revelam intenção
- ✅ Max 20 linhas por função, max 300 por arquivo
- ✅ JSDoc em APIs públicas

### Arquitetura (CRÍTICO)
- ✅ Lógica de negócio em `core/application/`, não em `api/modules/`
- ✅ Repository interfaces em `core/domain/`, implementações em `api/database/`
- ✅ `core` tem zero imports NestJS

### Padrões TypeScript
- ✅ `interface` para contratos
- ✅ `type` para aliases e unions
- ✅ `enum` → use `const` objects com `union types`

### Testes
- ✅ AAA (Arrange-Act-Assert) para unit tests
- ✅ Given-When-Then para e2e
- ✅ Uma asserção lógica por teste

---

## 🔗 Atalhos Rápidos

| Preciso...                         | Vejo em... |
|------------------------------------|-----------|
| Entender o projeto                 | `claude-code/CLAUDE.md` |
| Aprender a arquitetura             | `claude-code/architecture.md` |
| Entender o domínio                 | `claude-code/domain.md` |
| Criar novo módulo NestJS           | `claude-code/new-api-module.md` |
| Criar novo use case                | `claude-code/new-use-case.md` |
| Código limpo (universal)           | `CLEAN_CODE_RULES.md` |
| Regras TypeScript                  | `TYPESCRIPT_RULES.md` |
| Regras NestJS                      | `NEST_RULES.md` |
| Regras React                       | `REACT_RULES.md` |
| Fazer code review                  | `claude-code/review.md` |
| Configurar Claude Code             | `.claude-code.json` |

---

## 🎯 Checklist Before Commit

```
✓ pnpm typecheck (sem erros)
✓ pnpm lint (sem warnings)
✓ pnpm test (todos passando)
✓ Nomes revelam intenção
✓ Respeita direção de dependência (apps → core)
✓ Sem `any` types, sem `export default`
✓ Arquivos < 300 linhas, funções < 20 linhas
✓ JSDoc em APIs públicas
✓ Testes seguem AAA ou Given-When-Then
```

---

## 📞 Perguntas Frequentes

### P: Onde coloco a lógica de negócio?
**R**: Em `packages/core/application/use-cases/`. Use cases são orquestradores que usam repositories.

### P: Onde coloco a implementação de repository?
**R**: A interface fica em `core/domain/repositories/`, a implementação em `apps/api/src/database/repositories/`.

### P: Posso importar NestJS em `core/`?
**R**: **Não**. `core/` é framework-agnóstico. Se precisar, está estruturalmente errado.

### P: Qual padrão de teste devo usar?
**R**: Unit tests: AAA. E2E: Given-When-Then. Sem lógica em testes.

### P: Preciso criar um novo módulo. Por onde começo?
**R**: Leia `claude-code/new-api-module.md`. É um template completo.

---

## 📅 Histórico

- **21/02/2025**: Setup inicial da documentação e configuração Claude Code
- **Estrutura**: Monorepo com DDD + Clean Architecture + Hexagonal Architecture

---

**Dúvidas?** Consulte a documentação acima ou peça ao Claude Code para revisar a arquitetura.
