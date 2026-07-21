## 1. Migration

- [x] 1.1 Escrever teste unitário da migration `create-band-members-table` (up cria tabela com PK composta, FKs e índice; down remove a tabela), seguindo o padrão de `test/unit/infrastructure/typeorm/migrations/`
- [x] 1.2 Gerar/implementar a migration `create-band-members-table` em `src/infrastructure/typeorm/migrations/`: colunas `band_id`, `user_id`, `is_owner` (default `false`), `created_at`, `updated_at`; chave primária composta (`band_id`, `user_id`); FKs para `bands.id` e `users.id`; índice dedicado em `user_id`

## 2. Domínio — BandMemberEntity

- [x] 2.1 Escrever teste unitário de `BandMemberEntity` (`band_id`, `user_id`, `is_owner`, `created_at`, `updated_at`)
- [x] 2.2 Implementar `BandMemberEntity` em `src/domain/entities/band-member/band-member.entity.ts` (sem estender `BaseEntity`, já que não possui um único `id`)
- [x] 2.3 Criar a interface `IBandMemberRepository` em `src/domain/repositories/band-member/band-member.repository.interface.ts` com o método `save(bandMember: BandMemberEntity): Promise<void>`

## 3. Infraestrutura — persistência de band_members

- [x] 3.1 Escrever teste unitário de `BandMemberTypeormEntity`
- [x] 3.2 Implementar `BandMemberTypeormEntity` em `src/infrastructure/entities/band-member/band-member-typeorm.entity.ts` com chave primária composta e índice em `user_id`
- [x] 3.3 Escrever teste unitário de `BandMemberRepository`
- [x] 3.4 Implementar `BandMemberRepository` em `src/infrastructure/repository/band-member/band-member.repository.ts`

## 4. Transação atômica banda + dono

- [x] 4.1 Escrever teste unitário cobrindo o novo método `IBandRepository.saveWithOwner(band, ownerUserId)`, incluindo o cenário de rollback quando a criação do vínculo falha
- [x] 4.2 Estender `IBandRepository` com `saveWithOwner(band: BandEntity, ownerUserId: string): Promise<void>`
- [x] 4.3 Implementar `saveWithOwner` em `BandRepository` usando `DataSource.transaction()` para persistir a banda e o registro em `band_members` (`is_owner = true`) atomicamente

## 5. Aplicação — CreateBandUseCase

- [x] 5.1 Atualizar teste unitário de `CreateBandUseCase` para cobrir o novo parâmetro `userId` e a chamada a `bandRepository.saveWithOwner`
- [x] 5.2 Atualizar `CreateBandUseCaseInterface` e `CreateBandUseCase` para receber `userId` e delegar a `saveWithOwner`

## 6. HTTP — Controller e módulo

- [x] 6.1 Atualizar teste unitário de `BandController` para verificar que `request.user.id` é extraído e repassado ao use case
- [x] 6.2 Atualizar `BandController` (`POST /bands`) para ler o usuário autenticado da requisição e repassar seu `id` ao `CreateBandUseCase`
- [x] 6.3 Atualizar `BandFactoryModule` (e seu teste) para prover `IBandMemberRepository`/`DataSource` na composição de `BandRepository`

## 7. Testes e2e e cobertura

- [x] 7.1 Atualizar/criar teste e2e de `POST /bands` validando que o usuário autenticado é registrado em `band_members` com `is_owner = true`
- [x] 7.2 Rodar `npm run test:cov` e `npm run test:e2e`, garantindo 100% de cobertura e todos os testes verdes

## 8. Validação da existência do usuário autenticado

- [x] 8.1 Estender `UserFilter`/`IBandRepository` (`src/domain/repositories/user/user.repository.interface.ts`) com o campo opcional `id`
- [x] 8.2 Atualizar teste unitário de `CreateBandUseCase` cobrindo: busca do usuário por `id`, lançamento de `ApplicationNotFoundException` quando não encontrado, e que `saveWithOwner` não é chamado nesse caso
- [x] 8.3 Atualizar `CreateBandUseCase` para receber `IUserRepository`, validar a existência do usuário via `findBy({ id: userId })` antes de montar a `BandEntity`, lançando `ApplicationNotFoundException` (404) quando não encontrado
- [x] 8.4 Atualizar `BandFactoryModule` (e seu teste) para registrar `UserRepository`/`TypeOrmModule.forFeature([UserTypeormEntity])` e conectar ao `CreateBandUseCase`
- [x] 8.5 Criar teste e2e reproduzindo o incidente real relatado (usuário autentica, o registro é removido de `users` diretamente no banco, o token permanece válido) e validando que `POST /bands` retorna 404 em vez do erro de constraint (HTTP 500) que ocorria antes desta validação
- [x] 8.6 Rodar `npm run test:cov` e `npm run test:e2e` novamente, garantindo 100% de cobertura e todos os testes verdes
