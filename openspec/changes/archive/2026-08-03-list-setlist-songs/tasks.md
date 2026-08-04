## 1. Infraestrutura — busca em lote de músicas

- [x] 1.1 Adicionar `findAllByIds(ids: string[]): Promise<BandSongEntity[]>` a `IBandSongRepository` (`src/domain/repositories/band/band-song.repository.interface.ts`)
- [x] 1.2 Escrever teste unitário de `BandSongRepository.findAllByIds` (retorno com múltiplos IDs e retorno vazio)
- [x] 1.3 Implementar `BandSongRepository.findAllByIds` via `this.repository.findBy({ id: In(ids) })` (`src/infrastructure/repository/band/band-song.repository.ts`)

## 2. Aplicação — caso de uso de listagem

- [x] 2.1 Escrever teste unitário de `ListSetlistSongsUseCase`: setlist não encontrado → `ApplicationNotFoundException`
- [x] 2.2 Escrever teste unitário de `ListSetlistSongsUseCase`: setlist pertence a outra banda → `ApplicationNotFoundException`
- [x] 2.3 Escrever teste unitário de `ListSetlistSongsUseCase`: setlist sem músicas → retorna array vazio sem chamar `findAllByIds`
- [x] 2.4 Escrever teste unitário de `ListSetlistSongsUseCase`: setlist com músicas em posições fora de ordem → retorna pares `{ bandSetlistSong, bandSong }` ordenados por `position` ascendente
- [x] 2.5 Criar `ListSetlistSongsUseCaseInterface` e tipo `SetlistSong` em `src/application/usecase/band/interfaces/list-setlist-songs.usecase.interface.ts` (+ barrel `interfaces/index.ts`)
- [x] 2.6 Implementar `ListSetlistSongsUseCase` em `src/application/usecase/band/list-setlist-songs.usecase.ts` (valida posse do setlist, busca vínculos, busca músicas em lote, ordena e pareia por `position`)

## 3. DTOs de resposta

- [x] 3.1 Escrever teste unitário de `SetlistSongResponseDto.fromEntities` (mapeamento de `id`, `position` e `band_song` aninhado)
- [x] 3.2 Criar `SetlistSongResponseDto` em `src/shared/communication/dtos/band/setlist-song-response.dto.ts`, reaproveitando `BandSongResponseDto`
- [x] 3.3 Escrever teste unitário de `ListSetlistSongsResponseDto.fromEntities` (envelope `{ data: [...] }`, incluindo caso de array vazio)
- [x] 3.4 Criar `ListSetlistSongsResponseDto` em `src/shared/communication/dtos/band/list-setlist-songs-response.dto.ts`

## 4. HTTP — controller, decorator e wiring

- [x] 4.1 Criar decorator Swagger `ApiListSetlistSongs()` em `src/http/band/decorators/list-setlist-songs.decorator.ts` (200 com `ListSetlistSongsResponseDto`, 401, 403, 404)
- [x] 4.2 Adicionar token `LIST_SETLIST_SONGS_USE_CASE` e provider `useFactory` em `BandFactoryModule` (`src/http/band/band-factory.module.ts`)
- [x] 4.3 Adicionar handler `GET :id/setlists/:setlistId/songs` a `BandSetlistSongController`, reaproveitando `AddSongToSetlistParamDto` para os parâmetros de rota
- [x] 4.4 Escrever teste unitário do novo handler do `BandSetlistSongController` (chama o use case com `id`/`setlistId` e retorna `ListSetlistSongsResponseDto.fromEntities(...)`)

## 5. Testes e2e

- [x] 5.1 Criar `test/e2e/band-setlist-song/list.e2e-spec.ts` cobrindo: listagem com músicas ordenadas por `position`, listagem de setlist vazio, setlist inexistente (404), setlist de outra banda (404), banda inexistente (404), usuário não membro (403), sem autenticação (401)

## 6. Verificação final

- [x] 6.1 Rodar `npm run test:cov` e garantir 100% de cobertura (statements, branches, functions, lines)
- [x] 6.2 Rodar `npm run test:e2e` e garantir que todos os cenários passam
- [x] 6.3 Rodar lint/format (`npm run lint`, se configurado) e revisar Swagger gerado para o novo endpoint
