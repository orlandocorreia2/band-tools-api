## 1. Dependências e configuração

- [x] 1.1 Adicionar `@nestjs/jwt` ao `package.json`
- [x] 1.2 Adicionar `JWT_SECRET` e `JWT_EXPIRES_IN` a `env-config.validation.ts` (`JWT_EXPIRES_IN` em segundos, `number`)
- [x] 1.3 Adicionar getters `jwtSecret` e `jwtExpiresIn` a `EnvConfigService`
- [x] 1.4 Adicionar `JWT_SECRET` e `JWT_EXPIRES_IN` a `.env.example` (e `.env` local)

## 2. `IPasswordHasher.compare` (domain + infrastructure)

- [x] 2.1 Escrever teste unitário para `BcryptPasswordHasher.compare` (senha correta → `true`, senha incorreta → `false`)
- [x] 2.2 Adicionar `compare(plainPassword, hashedPassword): Promise<boolean>` à interface `IPasswordHasher`
- [x] 2.3 Implementar `compare` em `BcryptPasswordHasher` usando `bcrypt.compare`
- [x] 2.4 Rodar testes e confirmar 100% de cobertura no arquivo alterado

## 3. Caso de uso de login (application)

- [x] 3.1 Escrever testes unitários de `LoginUseCase`: sucesso, e-mail inexistente, senha incorreta
- [x] 3.2 Criar `LoginDto` em `src/shared/communication/dtos/auth/login.dto.ts` (`email` com `@IsEmail`, `password` com `@IsString`/`@IsNotEmpty`)
- [x] 3.3 Criar `LoginResponseDto` (`accessToken: string`)
- [x] 3.4 Criar `LoginUseCaseInterface` em `src/application/usecase/auth/interfaces/login.usecase.interface.ts`
- [x] 3.5 Implementar `LoginUseCase` em `src/application/usecase/auth/login.usecase.ts`: busca usuário por `email` via `IUserRepository`, compara senha via `IPasswordHasher.compare`, lança `ApplicationUnauthorizedException` em caso de falha, assina JWT via `JwtService` (payload `{ sub: user.id, email: user.email }`) e retorna `LoginResponseDto`
- [x] 3.6 Rodar testes e confirmar 100% de cobertura nos arquivos novos

## 4. `JwtAuthGuard` (http)

- [x] 4.1 Escrever testes unitários do `JwtAuthGuard`: token válido (permite acesso e popula `request.user`), token ausente, token malformado, token expirado
- [x] 4.2 Implementar `JwtAuthGuard` em `src/http/middlewares/jwt-auth.guard.ts`, implementando `CanActivate`, extraindo o header `Authorization: Bearer <token>`, verificando via `JwtService.verifyAsync` e lançando `ApplicationUnauthorizedException` em caso de falha
- [x] 4.3 Rodar testes e confirmar 100% de cobertura no arquivo novo

## 5. Endpoint e módulo (http)

- [x] 5.1 Criar `AuthFactoryModule` em `src/http/auth/auth-factory.module.ts` seguindo o padrão de `UserFactoryModule` (`static forRoot(): DynamicModule`), registrando `JwtModule.registerAsync` com `jwtSecret`/`jwtExpiresIn` do `EnvConfigService`, e exportando o token `LOGIN_USE_CASE` e o `JwtService`/`JwtAuthGuard` necessários
- [x] 5.2 Criar `AuthController` em `src/http/auth/auth.controller.ts` com `POST /auth/login`, injetando `LoginUseCaseInterface` pelo token, documentado via `@ApiOperation`/`@ApiResponse` (200, 400, 401, 422, 500)
- [x] 5.3 Registrar `AuthFactoryModule` no módulo raiz da aplicação (via `HttpModule`, importado por `AppModule`)
- [x] 5.4 Aplicar `@UseGuards(JwtAuthGuard)` em `POST /bands` (`BandController`), conforme decidido com o usuário

## 6. Testes e2e

- [x] 6.1 Escrever teste e2e para `POST /auth/login`: credenciais válidas retornam 200 + `accessToken`
- [x] 6.2 Escrever teste e2e para `POST /auth/login`: e-mail inexistente retorna 401
- [x] 6.3 Escrever teste e2e para `POST /auth/login`: senha incorreta retorna 401
- [x] 6.4 Escrever teste e2e para `POST /auth/login`: corpo malformado retorna 400
- [x] 6.5 Escrever teste e2e para `POST /auth/login`: campo obrigatório ausente retorna 422
- [x] 6.6 Escrever teste e2e para `POST /bands` (protegida por `@UseGuards(JwtAuthGuard)`): acesso sem token retorna 401, acesso com token inválido retorna 401, acesso com token válido obtido via login retorna sucesso

## 7. Finalização

- [x] 7.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions, lines)
- [x] 7.2 Rodar `npm run test:e2e` e confirmar que todos os testes passam
- [x] 7.3 Rodar lint/format (`npm run lint`) e corrigir os problemas introduzidos por esta mudança (os erros remanescentes são débito técnico pré-existente no `main`, ver nota abaixo)
- [x] 7.4 Atualizar documentação Swagger (tag `auth`, `@ApiBearerAuth` em `POST /bands`, exemplos de request/response)
- [x] 7.5 Commit seguindo Conventional Commits (ex.: `feat: user authentication with jwt`)

**Nota (7.3):** `npm run lint` já falhava no `main` antes desta mudança (~134 erros pré-existentes, principalmente `@typescript-eslint/unbound-method` em specs que fazem `expect(mock.metodo)` e `no-unsafe-*` em specs de `*FactoryModule` que usam `(module.providers as any[])`). Esta mudança seguiu os mesmos padrões já estabelecidos nesses arquivos de teste para manter consistência; os únicos erros exclusivos do código novo (`jwt-auth.guard.spec.ts`, `jwt-module-options.spec.ts`) foram corrigidos com tipagem explícita em vez de `any`.
