# NestJS Rules for Claude Code

## 1. Princípios Gerais TypeScript

- **Inglês** em todo código e documentação
- **Sempre declare tipos** — parâmetros, retornos, variáveis (zero `any`)
- **JSDoc** em classes e métodos públicos
- **Um export por arquivo**
- Sem linhas em branco dentro de funções

### Nomenclatura

| Contexto | Convenção |
|---|---|
| Classes | `PascalCase` |
| Variáveis, funções, métodos | `camelCase` |
| Arquivos e diretórios | `kebab-case` |
| Env vars e constantes | `UPPER_CASE` |
| Booleanos | `isLoading`, `hasError`, `canDelete` |
| Funções sem retorno | `executeX`, `saveX`, `sendX` |
| Funções com retorno booleano | `isX`, `hasX`, `canX` |

```typescript
// ✅
const MAX_RETRY_ATTEMPTS = 3;
const isUserActive = user.status === 'active';
async function fetchUserById(userId: string): Promise<User> { ... }
async function saveUserProfile(input: SaveUserInput): Promise<void> { ... }

// ❌
const n = 3;
const active = user.status === 'active';
async function user(id: string) { ... }
```

---

## 2. Funções

- **Máximo 20 instruções** — extraia se ultrapassar
- **Nível único de abstração** por função
- **Early return** para evitar aninhamento

```typescript
// ✅
async function processPayment(input: ProcessPaymentInput): Promise<PaymentResult> {
  if (!input.amount || input.amount <= 0) {
    throw new BadRequestException('Invalid amount');
  }
  const user = await this.userService.findById(input.userId);
  if (!user.isActive) {
    throw new ForbiddenException('Inactive user');
  }
  return this.gateway.charge(input);
}

// ❌
async function processPayment(input: ProcessPaymentInput) {
  if (input.amount && input.amount > 0) {
    const user = await this.userService.findById(input.userId);
    if (user.isActive) {
      return this.gateway.charge(input);
    }
  }
}
```

### RO-RO: Receive Object, Return Object

```typescript
// ✅
type CreateOrderInput = {
  readonly userId: string;
  readonly items: OrderItem[];
  readonly couponCode?: string;
};

type CreateOrderResult = {
  readonly orderId: string;
  readonly total: number;
  readonly estimatedDelivery: Date;
};

async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> { ... }

// ❌
async function createOrder(userId: string, items: OrderItem[], couponCode?: string) { ... }
```

---

## 3. Dados e Classes

- **Prefira imutabilidade** — `readonly` em propriedades, `as const` em literais
- **Encapsule validação** nas classes, não nas funções
- **SOLID** — especialmente SRP e DIP
- **Composição > herança**
- Máximo **200 instruções**, **10 métodos públicos**, **10 propriedades** por classe

```typescript
// ✅
class Money {
  constructor(
    readonly amount: number,
    readonly currency: string,
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
    if (!currency) throw new Error('Currency is required');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch');
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

---

## 4. Arquitetura de Módulos

### Estrutura de diretórios

```
src/
├── core/                        # Artefatos globais do Nest
│   ├── filters/                 # Exception filters globais
│   ├── guards/                  # Guards de permissão
│   ├── interceptors/            # Interceptors de request
│   └── middlewares/             # Middlewares globais
├── shared/                      # Serviços compartilhados
│   ├── utils/
│   └── services/
└── [domain]/                    # Um módulo por domínio principal
    ├── [domain].module.ts
    ├── [domain].controller.ts
    ├── models/
    │   ├── [domain].dto.ts      # Input — validado com class-validator
    │   └── [domain].types.ts    # Output — tipos simples
    └── services/
        ├── [domain].service.ts
        └── [entity].entity.ts   # MikroORM entity
```

### Module

```typescript
// user.module.ts
@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

### Controller

```typescript
// user.controller.ts
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Smoke test */
  @Get('admin/test')
  test(): string {
    return 'ok';
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponse> {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponse> {
    return this.userService.create(dto);
  }
}
```

### DTO — Input

```typescript
// create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @MinLength(8)
  readonly password: string;
}
```

### Types — Output

```typescript
// user.types.ts — tipos simples, sem decorators
export type UserResponse = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
};
```

### Service

```typescript
// user.service.ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {}

  /** @throws NotFoundException */
  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findOne({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.toResponse(user);
  }

  /** @throws ConflictException */
  async create(dto: CreateUserDto): Promise<UserResponse> {
    const exists = await this.userRepository.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');
    const user = this.userRepository.create(dto);
    await this.userRepository.persistAndFlush(user);
    return this.toResponse(user);
  }

  private toResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
```

### Entity (MikroORM)

```typescript
// user.entity.ts
@Entity()
export class UserEntity {
  @PrimaryKey()
  readonly id: string = uuidv4();

  @Property()
  name: string;

  @Property({ unique: true })
  email: string;

  @Property()
  passwordHash: string;

  @Property()
  readonly createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
```

---

## 5. Core Module

```typescript
// core/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}

// main.ts
app.useGlobalFilters(new HttpExceptionFilter());
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
```

---

## 6. Exceptions

- Use exceções para erros **inesperados**
- Catch apenas para: corrigir problema esperado, adicionar contexto, ou repassar ao handler global
- Use as exceções HTTP nativas do Nest (`NotFoundException`, `ConflictException`, `ForbiddenException`, etc.)

```typescript
// ✅ Adiciona contexto ao re-throw
try {
  await this.paymentGateway.charge(amount);
} catch (err) {
  throw new ServiceUnavailableException(
    `Payment gateway error: ${(err as Error).message}`,
  );
}

// ❌
throw new Error('something went wrong');
```

---

## 7. Testes

- **Arrange-Act-Assert** para unitários
- **Given-When-Then** para e2e
- Variáveis: `inputX`, `mockX`, `actualX`, `expectedX`
- Test doubles para dependências; exceto libs baratas de executar
- `GET admin/test` smoke test em **todo controller**

### Unitário (Service)

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: jest.Mocked<EntityRepository<UserEntity>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: { findOne: jest.fn(), create: jest.fn(), persistAndFlush: jest.fn() },
        },
      ],
    }).compile();
    service = module.get(UserService);
    mockUserRepository = module.get(getRepositoryToken(UserEntity));
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const inputId = 'user-123';
      const mockUser = { id: inputId, name: 'Alice', email: 'alice@example.com', createdAt: new Date() } as UserEntity;
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      // Act
      const actualResult = await service.findById(inputId);
      // Assert
      expect(actualResult).toMatchObject({ id: inputId, name: 'Alice' });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      mockUserRepository.findOne.mockResolvedValue(null);
      // Act & Assert
      await expect(service.findById('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });
});
```

### E2E (Módulo)

```typescript
// user.e2e-spec.ts
describe('UserModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(() => app.close());

  it('Given valid payload, When POST /users, Then returns 201 with user data', async () => {
    const inputPayload = { name: 'Alice', email: 'alice@example.com', password: 'secret123' };
    const { status, body } = await request(app.getHttpServer()).post('/users').send(inputPayload);
    expect(status).toBe(201);
    expect(body).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
    expect(body.id).toBeDefined();
  });
});
```

---

## Quick Reference

| ✅ Faça | ❌ Evite |
|---|---|
| Um export por arquivo | Múltiplos exports no mesmo arquivo |
| RO-RO para funções com 2+ params | Parâmetros posicionais soltos |
| DTOs com `class-validator` para input | Validação manual em services |
| Types simples para output | Expor entities diretamente na response |
| Early return para guards de condição | Aninhamento de `if` |
| `readonly` em propriedades imutáveis | Mutação desnecessária |
| Exceções HTTP do Nest | `throw new Error()` genérico |
| Um service por entity | Service "God object" |
| `admin/test` smoke test por controller | Controllers sem cobertura mínima |
| JSDoc em classes e métodos públicos | Código público sem documentação |
