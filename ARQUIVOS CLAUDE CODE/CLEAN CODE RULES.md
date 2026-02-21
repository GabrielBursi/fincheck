# Clean Code Rules for Claude Code

> Princípios universais de código limpo — linguagem e framework agnósticos.
> Baseados em *Clean Code* e *Clean Architecture* de Robert C. Martin (Uncle Bob).

---

## 1. Nomes

**Nomes revelam intenção.** Se você precisa de um comentário para explicar um nome, ele está errado.

```
// ✅
elapsedTimeInDays
getUsersByActiveStatus()
isPaymentOverdue

// ❌
d
getUsers2()
flag
```

- **Classes**: substantivo — `UserRepository`, `OrderProcessor`
- **Funções**: verbo — `sendEmail()`, `calculateTotal()`, `isExpired()`
- **Booleanos**: predicado — `isEmpty`, `hasPermission`, `canRetry`
- **Constantes**: intenção, não valor — `MAX_RETRY_ATTEMPTS`, não `THREE`
- Sem abreviações exceto as universais (`id`, `url`, `api`, `i/j` em loops)
- Sem prefixos de tipo húngaro (`strName`, `iCount`) — o tipo está no sistema de tipos
- Comprimento proporcional ao escopo: variável de loop `i` é aceitável; campo de classe não

---

## 2. Funções

**Uma função faz uma coisa. Uma. Só.**

- Máximo **20 linhas** — se ultrapassar, extraia
- **Um nível de abstração** por função — não misture lógica de negócio com I/O
- **Sem side effects escondidos** — o nome deve descrever tudo que a função faz
- **Máximo 3 parâmetros** — acima disso, use um objeto/struct
- **Sem flag parameters** — `render(true)` é ilegível; separe em `renderForMobile()` e `renderForDesktop()`
- Prefira **retorno único** — múltiplos returns só para early exit (guard clauses)

```
// ✅ Guard clauses — sem aninhamento
function processOrder(order):
  if order is null → throw error
  if order.items is empty → throw error
  if not user.hasBalance(order.total) → throw error
  return checkout(order)

// ❌ Pirâmide da morte
function processOrder(order):
  if order is not null:
    if order.items is not empty:
      if user.hasBalance(order.total):
        return checkout(order)
```

### Níveis de abstração

```
// ✅ Mesmo nível dentro de cada função
function publishArticle(article):
  validateArticle(article)        // alto nível
  enrichWithMetadata(article)     // alto nível
  persistToDatabase(article)      // alto nível
  notifySubscribers(article)      // alto nível

// ❌ Mistura de níveis
function publishArticle(article):
  if article.title == null → throw  // baixo nível
  article.slug = slugify(title)     // baixo nível
  db.query("INSERT INTO...")        // infraestrutura
  email.send(subscribers)          // baixo nível
```

---

## 3. Comentários

**Comentários são falhas do código em se expressar.**

```
// ❌ Comentário que repete o código
// Incrementa i
i++

// ❌ Comentário que substitui nome ruim
// Dias desde última modificação
int d = 14;

// ✅ Extraia para nome expressivo
int daysSinceLastModification = 14;
```

**Comentários aceitáveis:**
- **Legais**: licença, copyright
- **Intenção não-óbvia**: decisão arquitetural que o código não consegue expressar
- **TODO/FIXME**: rastreados e com responsável
- **JSDoc/docstrings**: em APIs públicas de bibliotecas

**Nunca:**
- Código comentado — use controle de versão
- Comentários desatualizados — mentem mais que silêncio
- Ruído: `// construtor`, `// getters e setters`

---

## 4. Estrutura e Formatação

**Código é lido de cima para baixo como um jornal (newspaper metaphor).**

- **Conceitos relacionados ficam juntos** — variáveis perto de onde são usadas
- **Distância vertical = relação** — funções que se chamam ficam próximas
- **Caller acima do callee** — quem chama fica acima de quem é chamado
- **Limite de 120 colunas** por linha — quebre o resto
- **Indentação consistente** — nunca misture tabs e espaços
- **Linhas em branco** separam conceitos; ausência delas os une

```
// ✅ Newspaper order — resumo no topo, detalhes abaixo
function generateReport(data):
  const summary = buildSummary(data)
  const details = buildDetails(data)
  return format(summary, details)

function buildSummary(data): ...
function buildDetails(data): ...
function format(summary, details): ...
```

---

## 5. Classes e Objetos

**Small. Focused. One reason to change.**

- **SRP (Single Responsibility)**: uma classe = uma responsabilidade = um motivo para mudar
- **OCP (Open/Closed)**: aberta para extensão, fechada para modificação — use interfaces/abstrações
- **LSP (Liskov Substitution)**: subtipos devem ser substituíveis por seus tipos base
- **ISP (Interface Segregation)**: interfaces pequenas e específicas, não gordas
- **DIP (Dependency Inversion)**: dependa de abstrações, não de implementações concretas

```
// ✅ DIP — depende da abstração
class OrderService:
  constructor(repository: OrderRepository)  // interface

// ❌ Depende da implementação concreta
class OrderService:
  constructor(postgresDb: PostgresDatabase)
```

- Máximo **10 propriedades** por classe
- Máximo **10 métodos públicos** por classe
- **Prefira composição a herança** — herança é acoplamento forte
- **Lei de Demeter**: fale só com amigos diretos — `a.getB().getC().doX()` é violação

```
// ✅
order.calculateShipping()

// ❌ train wreck
order.getCustomer().getAddress().getCity().getShippingRate()
```

---

## 6. Tratamento de Erros

**Erros são cidadãos de primeira classe — não os esconda.**

- **Use exceções, não códigos de retorno** para erros excepcionais
- **Nunca engula exceções** em blocos catch vazios
- **Adicione contexto** ao relançar — o que estava tentando fazer?
- **Falhe cedo** (fail fast) — valide na entrada, não no fundo da stack

```
// ✅
try:
  processPayment(order)
catch PaymentGatewayException as err:
  throw ServiceUnavailableException("Payment failed for order " + order.id, err)

// ❌
try:
  processPayment(order)
catch Exception:
  pass  // engoliu silenciosamente
```

- **Null object pattern** em vez de retornar `null` onde possível
- **Não passe `null`** como argumento — crie overloads ou use valores default

---

## 7. Testes

**Código de teste é tão importante quanto código de produção.**

- **F.I.R.S.T**: Fast, Independent, Repeatable, Self-validating, Timely
- **Uma asserção lógica por teste** — um teste, uma falha possível
- **Arrange-Act-Assert** (AAA) — separe as três fases visivelmente
- **Nomes descrevem o cenário**: `should_throw_when_order_is_empty`
- **Sem lógica em testes** — sem `if`, `for`, `switch` — testes devem ser triviais de ler
- **Test doubles** para dependências lentas/externas; evite mock de tudo

```
// ✅
function test_calculateTotal_applies_discount_when_coupon_is_valid():
  // Arrange
  order = Order(items=[item(price=100)])
  coupon = Coupon(discount=0.10)
  // Act
  total = order.calculateTotal(coupon)
  // Assert
  assert total == 90
```

---

## 8. Organização do Código

### Separação por camadas

```
UI / Presentation     → só exibe, sem lógica de negócio
Application / UseCase → orquestra, sem lógica de infraestrutura
Domain                → regras de negócio puras, sem dependências externas
Infrastructure        → banco, APIs externas, email, filesystem
```

**Regra de dependência**: setas sempre apontam para dentro. Domínio não depende de nada. Infraestrutura depende de tudo.

### Tamanhos limite

| Artefato | Limite |
|---|---|
| Arquivo | 200–300 linhas |
| Classe | 200 linhas |
| Função/método | 20 linhas |
| Parâmetros | 3 |
| Profundidade de aninhamento | 2 níveis |
| Colunas por linha | 120 |

### DRY vs WET vs DAMP

- **DRY** (Don't Repeat Yourself): extraia lógica duplicada — mas não prematuramente
- **WET** (Write Everything Twice): segunda duplicação → considere extrair; primeira → espere
- **DAMP** (Descriptive and Meaningful Phrases): em testes, repetição explícita é preferível a abstração obscura

---

## 9. Acoplamento e Coesão

**Alta coesão. Baixo acoplamento.**

- **Coesão**: tudo dentro de uma classe/módulo pertence junto — se você frequentemente precisa de metade de uma classe, divida-a
- **Acoplamento**: minimize dependências entre módulos — mudança em A não deve forçar mudança em B
- **Feature envy**: método que usa mais dados de outra classe do que da sua → mova-o
- **Shotgun surgery**: mudança de requisito afeta N arquivos → centralize a responsabilidade

---

## 10. Regras do Boy Scout

> **"Deixe o código mais limpo do que você encontrou."**

A cada mudança:
- Renomeie uma variável obscura que você encontrou
- Quebre uma função longa em duas
- Elimine uma duplicação que você notou
- Remova um comentário desnecessário

Refactoring não é uma tarefa separada — é parte do trabalho diário.

---

## Quick Reference

| ✅ Faça | ❌ Evite |
|---|---|
| Nomes que revelam intenção | Abreviações, nomes genéricos (`data`, `info`, `temp`) |
| Funções com propósito único | Funções "e também" (fazem duas coisas) |
| Guard clauses + early return | Pirâmides de aninhamento |
| Exceções com contexto | Catch vazio / engolir erros |
| Dependência de abstrações (DIP) | Dependência de implementações concretas |
| Testes AAA com nomes descritivos | Testes com lógica ou múltiplas asserções |
| Compor comportamento | Herdar para reutilizar |
| Código auto-documentado | Comentários que repetem o código |
| Refatorar continuamente | Acumular débito técnico para "depois" |
| Lei de Demeter: fale com amigos diretos | Train wrecks: `a.b().c().d()` |
