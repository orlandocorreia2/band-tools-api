## Why

A API já permite cadastrar usuários (`user-management`), mas não existe nenhuma forma de autenticá-los. Todas as rotas estão atualmente abertas para acesso anônimo, então não há como identificar quem está executando uma ação nem proteger endpoints que devem ser restritos a usuários autenticados.

## What Changes

- Adicionar um endpoint `POST /auth/login` que recebe `email` + `password`, valida as credenciais contra a tabela `users` já existente (coluna `password`, já criptografada via `IPasswordHasher`) e retorna um JWT de acesso assinado em caso de sucesso.
- Adicionar um `JwtAuthGuard` (implementa `CanActivate`) construído sobre `@nestjs/jwt` que verifica o header `Authorization: Bearer <token>`, anexa o id/email do usuário autenticado na request e rejeita tokens ausentes/inválidos/expirados com `401 Unauthorized`.
- O guard é aplicado explicitamente por rota/controller via `@UseGuards(JwtAuthGuard)` — nenhuma rota fica protegida a menos que o guard seja adicionado a ela.
- Adicionar configuração de assinatura JWT (`JWT_SECRET`, `JWT_EXPIRES_IN`) ao `EnvConfigService`/`env-config.validation.ts`.
- Adicionar um método `compare` (ou equivalente) à abstração `IPasswordHasher` para validar a senha informada no login contra o hash armazenado, reaproveitando a mesma abstração usada no cadastro de usuário.

## Capabilities

### New Capabilities
- `user-auth`: Endpoint de login (email/senha) que emite tokens JWT de acesso, e um guard de rota que verifica esses tokens para proteger endpoints.

### Modified Capabilities
- nenhuma — os requisitos de `user-management` não mudam; esta mudança apenas adiciona uma nova capability que consome a tabela `users` já existente.

## Impact

- **Código novo:** `LoginUseCase`, `AuthController` (`POST /auth/login`), `JwtAuthGuard`, `LoginDto`, `LoginResponseDto`, `AuthFactoryModule`.
- **Código modificado:** `env-config.service.ts` / `env-config.validation.ts` (novas env vars de JWT), interface/implementação de `IPasswordHasher` (adicionar `compare`), `package.json` (adicionar `@nestjs/jwt`).
- **Não afetado:** schema da tabela `users` (nenhuma migration necessária — reutiliza a coluna `password` existente), capability/spec `user-management`.
- **Config:** exige novas env vars `JWT_SECRET` e `JWT_EXPIRES_IN` em `.env` / `.env.example`.
