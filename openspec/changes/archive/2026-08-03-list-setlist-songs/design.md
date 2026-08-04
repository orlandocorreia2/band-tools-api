## Context

`BandSetlistSongController` já existe e concentra a rota `POST /bands/:id/setlists/:setlistId/songs`, protegida por `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)` no nível da classe. Esse guard cobre banda existe → usuário existe → usuário é membro (401/404/403), mas não sabe nada sobre `:setlistId` — a validação de que o setlist pertence à banda já é feita manualmente dentro do `AddSongToSetlistUseCase` (`assertSetlistBelongsToBand`), lançando `ApplicationNotFoundException` (404).

`BandSetlistSongRepository` já expõe `findAllByBandSetlistId(bandSetlistId)`, retornando os vínculos (`BandSetlistSongEntity`, apenas `band_setlist_id`/`band_song_id`/`position`) ordenados por `created_at` ascendente — hoje usado apenas para calcular `MAX(position)` em caso de colisão, onde a ordem não importa.

O usuário confirmou que a listagem deve compor dados do vínculo (`BandSetlistSongEntity`) com o nome da música (`BandSongEntity.title`), não apenas os IDs isolados. Isso torna este o primeiro endpoint do domínio de bandas a compor dados de duas entidades diferentes (`BandSetlistSongEntity` + `BandSongEntity`) em uma única resposta — porém de forma enxuta: o objeto retornado é uma projeção plana (achatada) das duas entidades, sem aninhar a música completa.

## Goals / Non-Goals

**Goals:**
- Adicionar `GET /bands/{id}/setlists/{setlistId}/songs`, retornando `{ data: [...] }` com um objeto plano por música do setlist: `id`, `band_setlist_id`, `band_song_id`, `position`, `title`, `created_at` e `updated_at`.
- Ordenar o resultado por `position` ascendente — reflete a ordem real de execução no show, diferente do padrão `created_at` usado em `list-band-setlists`/`list-band-songs`.
- Reaproveitar ao máximo a infraestrutura já existente: guard de autenticação/membro, validação de posse do setlist, `BandSetlistSongRepository.findAllByBandSetlistId`.
- Buscar os dados das músicas em uma única query em lote (evitar N+1), já que um setlist pode ter dezenas de músicas — mesmo que apenas o `title` seja exposto na resposta.

**Non-Goals:**
- Paginação, filtros ou ordenação customizável pelo cliente (fora de escopo; mesma decisão já tomada em `GET /bands/{id}/setlists` e `GET /bands/{id}/songs`).
- Alterações de schema — a tabela `band_setlist_songs` já existe.
- Reordenação (`PATCH`) ou remoção (`DELETE`) de músicas do setlist — propostas futuras, conforme já registrado em `add-song-to-setlist/design.md`.
- Alterar a ordenação de `BandSetlistSongRepository.findAllByBandSetlistId` (permanece por `created_at`, já que seu único outro consumidor — `AddSongToSetlistUseCase` — não depende de ordem).

## Decisions

### Handler adicionado ao `BandSetlistSongController` existente
A rota `GET :id/setlists/:setlistId/songs` é adicionada como novo método na mesma classe que já expõe `POST :id/setlists/:setlistId/songs`, em vez de criar um controller novo. Motivo: mesmo recurso (vínculo música-setlist), mesmos guards de classe, mesmos parâmetros de rota — criar um controller separado duplicaria configuração sem benefício. Mesmo raciocínio já aplicado em `list-band-setlists` (handler adicionado ao `BandSetlistController` existente).

### Reaproveitar `AddSongToSetlistParamDto` para os parâmetros de rota
O DTO já valida `id` (UUID v7, banda) e `setlistId` (UUID v7, setlist) — os mesmos dois parâmetros da rota de listagem, sem nenhum campo de corpo envolvido. Criar um novo DTO idêntico seria duplicação sem propósito.

### Validação de posse do setlist duplicada, não extraída
A checagem "`:setlistId` existe e pertence a `:id`" é repetida no novo `ListSetlistSongsUseCase`, no mesmo formato já usado em `AddSongToSetlistUseCase.assertSetlistBelongsToBand` (busca por `bandSetlistRepository.findById`, compara `band_id`, lança `ApplicationNotFoundException`).
**Alternativa considerada:** extrair um serviço/helper compartilhado (`SetlistOwnershipValidator`). Rejeitada por ora — apenas duas ocorrências, e a duplicação são três linhas idênticas; criar uma abstração para isso seria prematuro. Pode ser revisitado se um terceiro caso de uso precisar da mesma checagem.

### Composição de dados no use case, não na DTO
`ListSetlistSongsUseCase` busca os vínculos (`IBandSetlistSongRepository.findAllByBandSetlistId`) e as músicas correspondentes (`IBandSongRepository.findAllByIds`), ordena os vínculos por `position` ascendente e retorna um array de pares `{ bandSetlistSong: BandSetlistSongEntity; bandSong: BandSongEntity }` (tipo `SetlistSong`, exportado junto da interface do use case). O response DTO apenas mapeia esse array já pareado e ordenado — não conhece os repositórios nem faz o pareamento.
**Alternativa considerada:** o DTO receber os dois arrays separados (`bandSetlistSongs`, `bandSongs`) e fazer o `find`/pareamento internamente, como fazem os DTOs existentes que só recebem entidades. Rejeitada porque pareamento e ordenação são lógica de orquestração (comparar coleções, casar por FK), responsabilidade do use case — os DTOs existentes hoje só fazem mapeamento 1:1 de uma entidade para seus campos, sem lógica de junção.

### Novo método em lote `IBandSongRepository.findAllByIds`
Assinatura: `findAllByIds(ids: string[]): Promise<BandSongEntity[]>`, implementado via `this.repository.findBy({ id: In(ids) })`. Evita N+1 (uma consulta por música) ao montar a resposta. Se `ids` estiver vazio (setlist sem nenhuma música), o use case não chama o repositório — retorna `[]` diretamente, evitando uma consulta com `IN ()` vazio.
**Alternativa considerada:** reaproveitar `findById` (já existente) em loop dentro do use case. Rejeitada por gerar uma query por música; aceitável para poucas músicas, mas desnecessário já que uma query em lote é trivial de implementar.

### Novos DTOs de resposta, com projeção plana (achatada) das duas entidades
- `SetlistSongResponseDto`: objeto plano com `id` (o `id` do vínculo em `band_setlist_songs`, útil para futuras operações de reordenação/remoção), `band_setlist_id`, `band_song_id`, `position`, `title` (extraído de `BandSongEntity.title`), `created_at` e `updated_at` (do vínculo em `band_setlist_songs`, não da música). Mapper estático `fromEntities(setlistSongs: SetlistSongPair[])`.
- `ListSetlistSongsResponseDto`: `{ data: SetlistSongResponseDto[] }`, mesmo padrão de envelope de `ListBandSetlistsResponseDto`/`ListBandSongsResponseDto`.
Ambos em `src/shared/communication/dtos/band/`, junto dos DTOs de setlist/música já existentes.
**Alternativa considerada:** aninhar a música completa via `band_song: BandSongResponseDto` (com todos os campos: `tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes`). Rejeitada por decisão explícita do usuário — a listagem do setlist só precisa do nome da música para exibição; os demais detalhes ficam disponíveis via `GET /bands/{id}/songs`, evitando um payload maior que o necessário.

### Novo decorator Swagger `ApiListSetlistSongs()`
Em `src/http/band/decorators/list-setlist-songs.decorator.ts`, documentando 200 (`ListSetlistSongsResponseDto`), 401, 403 e 404 — os três últimos herdados do guard de classe e da validação de posse do setlist, mesmo padrão de `ApiListBandSetlists`.

### Wiring: novo token `LIST_SETLIST_SONGS_USE_CASE`
Adicionado ao `BandFactoryModule` existente (já consolidado para todo o contexto de banda/setlist/repertório desde `add-song-to-setlist`), seguindo o mesmo padrão `useFactory` dos demais tokens.

## Risks / Trade-offs

- [Ausência de paginação pode se tornar um problema para setlists com muitas músicas] → Aceito por ora, mesma decisão já validada em `GET /bands/{id}/setlists` e `GET /bands/{id}/songs`.
- [Duplicar a validação de posse do setlist entre `AddSongToSetlistUseCase` e `ListSetlistSongsUseCase` pode divergir com o tempo se uma delas for alterada sem a outra] → Aceito por ora (duas ocorrências apenas); reavaliar extração de helper compartilhado se um terceiro caso de uso surgir.
- [`findAllByIds` com uma lista muito grande de IDs poderia gerar uma cláusula `IN` extensa] → Aceito: mesmo volume esperado de `findAllByBandSetlistId` (dezenas de músicas por setlist, não milhares), sem necessidade de paginação interna.
