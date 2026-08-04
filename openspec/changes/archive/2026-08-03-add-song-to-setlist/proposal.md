## Why

Os setlists de uma banda já podem ser cadastrados e listados, mas ainda não existe forma de associar músicas do repertório a um setlist. Sem essa associação, o setlist é apenas um nome vazio — a funcionalidade só se torna útil quando é possível montar a lista de músicas que serão tocadas, na ordem desejada.

## What Changes

- Novo endpoint `POST /bands/:id/setlists/:setlistId/songs`, autenticado, para adicionar uma música do repertório da banda a um setlist.
- Corpo da requisição com dois campos obrigatórios: `bandSongId` (UUID da música em `band_songs`) e `position` (posição da música no setlist).
- Nova tabela `band_setlist_songs`, com FKs para `band_setlists.id` e `band_songs.id`, e coluna `position`.
- Novo domínio, entidade TypeORM, repositório e caso de uso para o vínculo música-setlist.
- Validações antes de persistir: banda existe, usuário autenticado existe e é membro da banda, setlist existe e pertence à banda, música (`bandSongId`) existe e pertence à mesma banda.
- A mesma música pode ser adicionada mais de uma vez ao setlist (sem validação de duplicidade). Se a `position` informada já estiver em uso por outra música do mesmo setlist, o sistema ignora o valor enviado e posiciona a nova música na última posição do setlist (decisão registrada em design.md).

## Capabilities

### New Capabilities
- `band-setlist-songs`: cadastro de músicas do repertório da banda em um setlist específico, com posição, através de `POST /bands/:id/setlists/:setlistId/songs`.

### Modified Capabilities
(nenhuma — capabilities existentes `band-setlists` e `band-repertoire` não têm seus requisitos alterados; apenas passam a ser referenciadas como pré-condição pela nova capability)

## Impact

- **Banco de dados**: nova migration criando a tabela `band_setlist_songs` (FKs `ON DELETE CASCADE` para `band_setlists` e `band_songs`, seguindo o padrão das migrations existentes).
- **Domínio**: nova entidade `BandSetlistSongEntity` em `src/domain/entities/band-setlist-song/`.
- **Infraestrutura**: nova entidade TypeORM `BandSetlistSongTypeormEntity` e repositório `BandSetlistSongRepository`.
- **Aplicação**: novo caso de uso `AddSongToSetlistUseCase`, dependente de `IBandSetlistSongRepository` (`save` e `findAllByBandSetlistId`, para resolver colisão de `position`), `IBandSetlistRepository` e `IBandSongRepository` (estas duas últimas precisarão de um novo método `findById`, hoje inexistente).
- **HTTP**: novo controller (ou handler adicional no `BandSetlistController`, a decidir em design.md) para a rota `POST /bands/:id/setlists/:setlistId/songs`, protegido por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`.
- **DTOs**: novo `AddSongToSetlistDto` (`bandSongId: string`, `position: number`) com validação via `class-validator` e documentação Swagger.
- **Sem impacto** em `band-setlists` ou `band-repertoire` existentes — a nova capability apenas consome dados dessas duas.
