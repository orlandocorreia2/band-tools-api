## Context

O projeto já possui cadastro de usuário (`user-management`) com senha armazenada como hash `bcrypt` (`IPasswordHasher.hash`, custo configurável via `BCRYPT_SALT_ROUNDS`). Não existe hoje nenhum mecanismo de autenticação nem de proteção de rotas — todo endpoint é público. É necessário adicionar login por `email`/`password` e um guard reutilizável para proteger rotas específicas, seguindo a arquitetura em camadas (domain/application/infrastructure/http) e o padrão de `*FactoryModule` já usado em `UserFactoryModule`.

Decisões já validadas com o usuário:
- Estratégia de token: **JWT via `@nestjs/jwt`** (pacote oficial do Nest, sem Passport).
- Escopo do guard: **por rota**, via `@UseGuards(JwtAuthGuard)` explícito em cada controller/handler que precisar de proteção — nenhum guard global.

## Goals / Non-Goals

**Goals:**
- Permitir login com `email` + `password`, retornando um JWT de acesso assinado.
- Fornecer um `JwtAuthGuard` (`CanActivate`) que valida o token no header `Authorization: Bearer <token>` e pode ser adicionado via `@UseGuards` a qualquer rota.
- Reaproveitar a infraestrutura existente de hashing de senha (`IPasswordHasher`), estendendo-a com um método de comparação.
- Anexar os dados do usuário autenticado (`id`, `email`) à `request` para uso posterior por controllers/guards.

**Non-Goals:**
- Refresh token / rotação de token — fora de escopo nesta mudança.
- Logout / blacklist de token (JWT stateless, sem revogação server-side).
- Guard global aplicado automaticamente a todas as rotas — cada rota protegida precisa declarar `@UseGuards(JwtAuthGuard)` explicitamente.
- Alteração no schema da tabela `users` — nenhuma migration é necessária.
- Recuperação de senha / troca de senha.

## Decisions

### 1. `@nestjs/jwt` em vez de Passport
`@nestjs/jwt` expõe `JwtService.sign()`/`JwtService.verifyAsync()` diretamente, permitindo implementar o `JwtAuthGuard` como uma classe simples que implementa `CanActivate`, sem a camada extra de `PassportStrategy`/`AuthGuard('jwt')`. Isso está alinhado ao pedido do usuário de usar "os recursos do próprio NestJS" e evita uma dependência adicional (`passport`, `passport-jwt`, `@types/passport-jwt`) para um caso de uso simples (um único formato de token, sem múltiplas estratégias).

**Alternativa considerada:** `@nestjs/passport` + `passport-jwt`. Rejeitada por adicionar complexidade (Strategy class, `PassportModule.register`) sem benefício para um único mecanismo de autenticação.

### 2. Guard aplicado por rota, não globalmente
`JwtAuthGuard` é um `@Injectable()` comum, adicionado via `@UseGuards(JwtAuthGuard)` no controller/handler desejado — não é registrado como `APP_GUARD`. Rotas como `POST /users` (cadastro) e `POST /auth/login` permanecem públicas por padrão, sem necessidade de um decorator `@Public()` para exceção.

**Alternativa considerada:** guard global (`APP_GUARD`) com decorator `@Public()` de opt-out. Rejeitada por decisão explícita do usuário — o pedido foi "criar um auth guard para que seja adicionado nas rotas" (aplicação explícita), e o guard global adicionaria um mecanismo de exceção (`@Public()`) não solicitado.

### 3. Estrutura de código segue o padrão de `UserFactoryModule`
Novo módulo `AuthFactoryModule` (`src/http/auth/auth-factory.module.ts`) com `static forRoot(): DynamicModule`, expondo um token `LOGIN_USE_CASE` via `useFactory`, espelhando exatamente `UserFactoryModule`. Novo use case `LoginUseCase` em `src/application/usecase/auth/login.usecase.ts`, implementando uma interface `LoginUseCaseInterface`. `AuthController` injeta a interface pelo token, nunca a classe concreta.

`JwtAuthGuard` vive em `src/http/middlewares/` (mesmo diretório dos outros componentes transversais de HTTP, como `ExceptionFilterMiddleware`), já que é um componente de infraestrutura HTTP reutilizável entre controllers, não específico do módulo `auth`.

**Nota de implementação:** o NestJS resolve as dependências de um guard referenciado via `@UseGuards(Classe)` usando o injector do módulo *onde o controller está declarado* — não o módulo que originalmente proveu/exportou o guard. Por isso `JwtAuthGuard` (e o `JwtModule.registerAsync` de que ele depende) é registrado diretamente como provider do `HttpModule` — módulo onde todos os controllers (`BandController` incluso) são declarados —, e não apenas exportado pelo `AuthFactoryModule`. As opções do `JwtModule.registerAsync` foram extraídas para `src/shared/config/jwt-module-options.ts` e reaproveitadas tanto pelo `AuthFactoryModule` (para assinar tokens no login) quanto pelo `HttpModule` (para o `JwtAuthGuard` verificar tokens), evitando duplicação da configuração.

### 4. `IPasswordHasher` ganha o método `compare`
```ts
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
  compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
```
`BcryptPasswordHasher.compare` delega para `bcrypt.compare`. Mantém a mesma abstração usada no cadastro (`IPasswordHasher`), evitando acoplar o `LoginUseCase` diretamente ao `bcrypt`.

### 5. Payload do JWT e configuração
- Payload assinado: `{ sub: user.id, email: user.email }`.
- `JwtService` configurado via `JwtModule.registerAsync` dentro de `AuthFactoryModule`, lendo `JWT_SECRET` e `JWT_EXPIRES_IN` do `EnvConfigService` (novos getters `jwtSecret` e `jwtExpiresIn`), validados em `env-config.validation.ts` (`@IsString`/`@IsNotEmpty` para `JWT_SECRET`; `JWT_EXPIRES_IN` é `number`, em segundos, ex.: `3600` para 1 hora, validado com `@IsNumber`/`@Min(1)`).
- `JwtAuthGuard` usa o mesmo `JwtService` (injetado via `AuthFactoryModule`, exportado para ser usado onde o guard for aplicado) para verificar o token com `verifyAsync`.

### 6. Resposta do login
`POST /auth/login` retorna `200 OK` com `{ accessToken: string }` (`LoginResponseDto`, em camelCase). A senha nunca é retornada em nenhuma resposta (mesma regra do cadastro).

### 7. Erros
- Credenciais inválidas (`email` não encontrado OU senha não confere): `ApplicationUnauthorizedException` (já existente, HTTP 401) — mensagem genérica ("E-mail ou senha inválidos") para não revelar se o e-mail existe.
- Token ausente, malformado ou expirado no guard: `ApplicationUnauthorizedException` (HTTP 401), lançada dentro do `JwtAuthGuard.canActivate`, capturada pelo `ExceptionFilterMiddleware` global existente.
- Corpo malformado / campos ausentes: mesmo padrão já usado em `CreateUserDto` (400 nativo do Fastify / 422 via `ValidationPipe`).

## Risks / Trade-offs

- **[Risco] Sem revogação de token (logout real).** Um JWT roubado continua válido até expirar. → Mitigação: `JWT_EXPIRES_IN` curto (ex.: `1h`) como valor recomendado; revogação/blacklist fica para uma mudança futura caso necessário.
- **[Risco] Guard por rota é fácil de esquecer em um novo endpoint.** Como não há guard global, um desenvolvedor pode criar uma rota sensível sem `@UseGuards(JwtAuthGuard)`. → Mitigação: decisão consciente do usuário: escopo do projeto atual não exige proteção universal ainda; revisar em code review.
- **[Risco] `JWT_SECRET` fraco ou ausente em produção.** → Mitigação: validação obrigatória (`@IsNotEmpty`) em `env-config.validation.ts` impede o boot da aplicação sem o segredo configurado.

## Migration Plan

Sem migration de banco de dados (reutiliza `users.password`). Deploy consiste em: adicionar `JWT_SECRET`/`JWT_EXPIRES_IN` às variáveis de ambiente de cada stage (`.env`, pipelines de CI/CD, Docker Compose) antes do deploy do código — a aplicação falha o boot sem essas variáveis devido à validação em `env-config.validation.ts`. Não há rollback especial: reverter o código é suficiente, pois nenhuma coluna/tabela nova foi criada.
