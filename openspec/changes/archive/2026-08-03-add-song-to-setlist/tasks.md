## 1. Migration

- [x] 1.1 Gerar migration `create-band-setlist-songs-table` criando `band_setlist_songs` (`id`, `band_setlist_id` FK → `band_setlists.id` `ON DELETE CASCADE` indexado, `band_song_id` FK → `band_songs.id` `ON DELETE CASCADE`, `position` inteiro, `created_at`, `updated_at`)
- [x] 1.2 Rodar `npm run migration:run` localmente e validar `up`/`down` (revert + run novamente)

## 2. Domínio e infraestrutura (entidades)

- [x] 2.1 Criar `BandSetlistSongEntity` em `src/domain/entities/band/band-setlist-song.entity.ts` (estende `BaseEntity`, campos `band_setlist_id`, `band_song_id`, `position`)
- [x] 2.2 Criar `BandSetlistSongTypeormEntity` em `src/infrastructure/entities/band/band-setlist-song-typeorm.entity.ts`

## 3. Repositórios

- [x] 3.1 Escrever teste unitário para `BandSetlistSongRepository.save` (persiste o vínculo, seguindo o padrão de `BandSetlistRepository.save`)
- [x] 3.2 Definir `IBandSetlistSongRepository` em `src/domain/repositories/band/band-setlist-song.repository.interface.ts` (`save(bandSetlistSong): Promise<void>`, `findAllByBandSetlistId(bandSetlistId): Promise<BandSetlistSongEntity[]>`)
- [x] 3.3 Implementar `BandSetlistSongRepository` em `src/infrastructure/repository/band/band-setlist-song.repository.ts` até os testes passarem
- [x] 3.4 Escrever teste unitário para `BandSetlistSongRepository.findAllByBandSetlistId` (retorna os vínculos existentes do setlist, ordenados de forma estável)
- [x] 3.5 Escrever teste unitário para `BandSetlistRepository.findById` (retorna o setlist quando existe, `null` quando não existe)
- [x] 3.6 Adicionar `findById(id): Promise<BandSetlistEntity | null>` a `IBandSetlistRepository` e implementar em `BandSetlistRepository`
- [x] 3.7 Escrever teste unitário para `BandSongRepository.findById` (retorna a música quando existe, `null` quando não existe)
- [x] 3.8 Adicionar `findById(id): Promise<BandSongEntity | null>` a `IBandSongRepository` e implementar em `BandSongRepository`

## 4. Caso de uso

- [x] 4.1 Escrever testes unitários para `AddSongToSetlistUseCase`: persiste o vínculo com a `position` informada quando ela não colide com nenhum vínculo existente do setlist (incluindo setlist ainda sem músicas)
- [x] 4.2 Escrever testes unitários: quando a `position` informada já está em uso no mesmo setlist, persiste o vínculo com `position = MAX(position existente) + 1`, ignorando o valor informado
- [x] 4.3 Escrever testes unitários: lança exceção de "não encontrado" quando o setlist não existe ou pertence a outra banda
- [x] 4.4 Escrever testes unitários: lança exceção de "não encontrado" quando a música (`bandSongId`) não existe ou pertence a outra banda
- [x] 4.5 Escrever testes unitários: permite persistir vínculo com `bandSongId` já existente no mesmo setlist (duplicata)
- [x] 4.6 Implementar `AddSongToSetlistUseCaseInterface` em `src/application/usecase/band/interfaces/add-song-to-setlist.usecase.interface.ts` (exportada pelo barrel `interfaces/index.ts` compartilhado, junto com as interfaces de banda, setlist e repertório)
- [x] 4.7 Implementar `AddSongToSetlistUseCase` em `src/application/usecase/band/add-song-to-setlist.usecase.ts` (injeta `IBandSetlistSongRepository`, `IBandSetlistRepository`, `IBandSongRepository`; resolve colisão de `position` via `findAllByBandSetlistId`) até os testes passarem

## 5. DTO e documentação Swagger

- [x] 5.1 Criar `AddSongToSetlistDto` (`bandSongId`: string UUID v7 obrigatório, `position`: inteiro positivo obrigatório) em `src/shared/communication/dtos/band/add-song-to-setlist.dto.ts`
- [x] 5.2 Criar decorator Swagger `ApiAddSongToSetlist` em `src/http/band/decorators/add-song-to-setlist.decorator.ts`, documentando 201/400/401/403/404/422

## 6. Camada HTTP

- [x] 6.1 Unir o provisionamento do `AddSongToSetlistUseCase` ao `BandFactoryModule` único em `src/http/band/band-factory.module.ts` (que já concentra os factory modules de banda, setlist e repertório — registra também `BandSetlistSongRepository` e `BandSongRepository`, expõe `ADD_SONG_TO_SETLIST_USE_CASE` ao lado de todos os demais tokens, sem factory module separado por sub-recurso)
- [x] 6.2 Criar `BandSetlistSongController` em `src/http/band/band-setlist-song.controller.ts` com `POST /bands/:id/setlists/:setlistId/songs`, `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)`
- [x] 6.3 Registrar `BandSetlistSongController` em `src/http/http.module.ts` (o `BandFactoryModule.forRoot()` já registrado passa a cobrir também o novo caso de uso)

## 7. Testes e2e

- [x] 7.1 Escrever teste e2e: cadastro com `bandSongId` e `position` válidos retorna 201 e persiste o vínculo
- [x] 7.2 Escrever teste e2e: `bandSongId` ausente/inválido retorna 422
- [x] 7.3 Escrever teste e2e: `position` ausente/inválida retorna 422
- [x] 7.4 Escrever teste e2e: banda inexistente (404), usuário autenticado inexistente (404), usuário não membro (403), sem autenticação (401)
- [x] 7.5 Escrever teste e2e: setlist inexistente ou pertencente a outra banda retorna 404
- [x] 7.6 Escrever teste e2e: música (`bandSongId`) inexistente ou pertencente a outra banda retorna 404
- [x] 7.7 Escrever teste e2e: mesma música adicionada duas vezes ao setlist retorna 201 em ambas as requisições
- [x] 7.8 Escrever teste e2e: `position` colidindo com um vínculo existente retorna 201 e persiste o vínculo com `position` recalculada como a última do setlist (`MAX + 1`), não a informada
- [x] 7.9 Escrever teste e2e: corpo malformado retorna 400

## 8. Finalização

- [x] 8.1 Rodar `npm run test:cov` e garantir 100% de cobertura (statements, branches, functions, lines)
- [x] 8.2 Rodar `npm run test:e2e` e garantir todos os testes passando
- [x] 8.3 Rodar lint/format (`npm run lint`, `npm run format` se aplicável) antes do commit
