## 1. Migration

- [x] 1.1 Gerar migration `create-band-setlists-table` criando `band_setlists` (`id`, `band_id` FK → `bands.id` `ON DELETE CASCADE` indexado, `name`, `created_at`, `updated_at`)
- [x] 1.2 Rodar `npm run migration:run` localmente e validar `up`/`down` (revert + run novamente)

## 2. Domínio e infraestrutura (entidades)

- [x] 2.1 Criar `BandSetlistEntity` em `src/domain/entities/band-setlist/band-setlist.entity.ts` (estende `BaseEntity`, campos `band_id`, `name`)
- [x] 2.2 Criar `BandSetlistTypeormEntity` em `src/infrastructure/entities/band-setlist/band-setlist-typeorm.entity.ts`

## 3. Repositório

- [x] 3.1 Escrever teste unitário para `BandSetlistRepository.save` (persiste o setlist, seguindo o padrão de `BandSongRepository.save`)
- [x] 3.2 Definir `IBandSetlistRepository` em `src/domain/repositories/band-setlist/band-setlist.repository.interface.ts` (`save(setlist): Promise<void>`)
- [x] 3.3 Implementar `BandSetlistRepository` em `src/infrastructure/repository/band-setlist/band-setlist.repository.ts` até o teste passar

## 4. Caso de uso

- [x] 4.1 Escrever testes unitários para `CreateBandSetlistUseCase`: cria setlist com `name` válido
- [x] 4.2 Implementar `CreateBandSetlistUseCaseInterface` em `src/application/usecase/band-setlist/interfaces/create-band-setlist.usecase.interface.ts`
- [x] 4.3 Implementar `CreateBandSetlistUseCase` em `src/application/usecase/band-setlist/create-band-setlist.usecase.ts` até os testes passarem

## 5. DTO e documentação Swagger

- [x] 5.1 Criar `CreateBandSetlistDto` (`name`: string mínimo 1 caractere) em `src/shared/communication/dtos/band-setlist/create-band-setlist.dto.ts`
- [x] 5.2 Criar decorator Swagger `ApiCreateBandSetlist` em `src/http/band-setlist/decorators/create-band-setlist.decorator.ts`, documentando 201/400/401/403/404/422

## 6. Camada HTTP

- [x] 6.1 Criar `BandSetlistFactoryModule` em `src/http/band-setlist/band-setlist-factory.module.ts` (registra `BandSetlistRepository`, expõe `CREATE_BAND_SETLIST_USE_CASE`)
- [x] 6.2 Criar `BandSetlistController` em `src/http/band-setlist/band-setlist.controller.ts` com `POST /bands/:id/setlists`, `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)`
- [x] 6.3 Registrar `BandSetlistController` e `BandSetlistFactoryModule.forRoot()` em `src/http/http.module.ts`

## 7. Testes e2e

- [x] 7.1 Escrever teste e2e: cadastro com `name` válido retorna 201 e persiste o setlist
- [x] 7.2 Escrever teste e2e: `name` ausente/vazio retorna 422
- [x] 7.3 Escrever teste e2e: banda inexistente (404), usuário autenticado inexistente (404), usuário não membro (403), sem autenticação (401)
- [x] 7.4 Escrever teste e2e: corpo malformado retorna 400

## 8. Finalização

- [x] 8.1 Rodar `npm run test:cov` e garantir 100% de cobertura (statements, branches, functions, lines)
- [x] 8.2 Rodar `npm run test:e2e` e garantir todos os testes passando
- [x] 8.3 Rodar lint/format (`npm run lint`, `npm run format` se aplicável) antes do commit
