## Context

O endpoint `POST /users/contacts` já existe e persiste contatos na tabela `user_contacts`, vinculados ao usuário autenticado via `user_id`. Não existe hoje nenhuma forma de consultar esses contatos — a funcionalidade de agenda de contatos fica incompleta sem uma listagem. A mudança é isolada ao módulo `contact` (domain, application, infrastructure, http) e replica um padrão já validado no projeto: `GET /bands` → `ListBandsByUserUseCase` → `BandRepository.findAllByUserId`.

## Goals / Non-Goals

**Goals:**
- Expor `GET /users/contacts`, retornando somente os contatos cujo `user_id` seja o do usuário autenticado (JWT), sem exceção.
- Seguir exatamente a mesma estrutura em camadas usada em `create-contact` e em `list-bands-by-user`: interface de repositório no domínio, implementação no infra, use case na aplicação, controller + decorator + DTOs no http.
- Cobertura de teste unitário 100% (statements/branches/functions/lines) e e2e cobrindo isolamento entre usuários.

**Non-Goals:**
- Paginação, filtros (por nome, role, venue_name) ou ordenação customizável — nenhuma listagem existente no projeto (`list-bands-by-user`, `list-band-songs`, `list-band-setlists`, `list-setlist-songs`) implementa isso hoje; fica fora de escopo até haver uma necessidade real.
- Alteração de schema — a tabela `user_contacts` já possui `user_id` indexado (`@Index()` em `contact-typeorm.entity.ts`), suficiente para esta consulta.
- Edição/remoção de contatos — fora do escopo desta mudança.

## Decisions

- **Novo método no repositório em vez de query builder customizada**: `IContactRepository.findAllByUserId(userId: string): Promise<ContactEntity[]>`. Como a consulta é direta (`WHERE user_id = :userId`, sem joins — diferente de `BandRepository`, que precisa de `band_member`), a implementação usa `repository.find({ where: { user_id: userId }, order: { created_at: 'DESC' } })`, mais simples que um `createQueryBuilder`. Alternativa considerada: reaproveitar `createQueryBuilder` por consistência visual com `BandRepository` — rejeitada por adicionar complexidade sem necessidade, já que não há join.
- **Ordenação por `created_at DESC`**: mesma decisão usada em `ListBandsByUserUseCase`, mostrando os contatos mais recentes primeiro. Mantém consistência de UX entre listagens do sistema.
- **Autorização por `user_id` extraído do JWT, nunca de parâmetro de rota/query**: o `userId` usado no `WHERE` vem exclusivamente de `request.user.id` (populado pelo `JwtAuthGuard`), o mesmo padrão do `POST /users/contacts` e de `GET /bands`. Isso elimina a possibilidade de um usuário forjar um `user_id` de terceiro para enumerar contatos de outra pessoa (IDOR) — não há nenhum identificador de usuário aceito via `query`/`body` neste endpoint.
- **DTOs de resposta dedicados (`ContactResponseDto` / `ListContactsResponseDto`)** em vez de devolver a `ContactEntity` diretamente: replica o padrão de `BandResponseDto` / `ListBandsResponseDto`, garantindo que apenas os campos destinados ao cliente sejam serializados e documentados no Swagger.
- **Reaproveitamento do `ContactController` e `ContactFactoryModule` existentes**: novo método `list()` no controller (`@Get()`) e novo provider `LIST_CONTACTS_BY_USER_USE_CASE` no factory module, em vez de criar um controller/módulo paralelo — mantém a coesão por domínio já estabelecida.

## Risks / Trade-offs

- [Ausência de paginação] Se o número de contatos por usuário crescer muito, o payload de resposta pode ficar grande → Mitigação: não é um risco imediato (cenário de uso é agenda pessoal de contatos, volume baixo); mesma decisão já aceita em `GET /bands` e demais listagens. Pode ser revisitado com paginação real caso surja necessidade.
- [Vazamento de dados entre usuários caso o filtro por `user_id` seja esquecido em uma implementação futura] → Mitigação: cobertura de teste unitário do repositório e e2e dedicado ao cenário "usuário A não vê contatos do usuário B", tornando a regressão detectável em CI.
