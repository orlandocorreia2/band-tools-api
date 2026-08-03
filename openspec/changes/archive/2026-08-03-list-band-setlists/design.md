## Context

`BandSetlistController` já existe e concentra as rotas de setlists sob o prefixo `bands`, protegidas por `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)` no nível da classe. O `AuthUserIsMemberBandGuard` já implementa toda a cadeia de validação exigida (parâmetro é UUIDv7 válido → banda existe → usuário autenticado existe → usuário é membro da banda), reutilizada do endpoint `POST /bands/:id/setlists`. O padrão de resposta `{ "data": [...] }` para listagens já foi estabelecido em `GET /bands/{bandId}/songs` (`ListBandSongsResponseDto` + `BandSongResponseDto`), sem interceptor global — cada response DTO de listagem monta o envelope manualmente.

## Goals / Non-Goals

**Goals:**
- Adicionar `GET /bands/{bandId}/setlists`, retornando todos os setlists da banda em `{ data: [...] }`.
- Reaproveitar ao máximo a infraestrutura de autenticação/autorização já existente (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`), sem duplicar lógica de verificação de banda/membro.
- Seguir exatamente o padrão arquitetural já validado em `GET /bands/{bandId}/songs` (use case de leitura, response DTO com mapper estático, decorator Swagger dedicado).

**Non-Goals:**
- Paginação, filtros ou ordenação customizável pelo cliente (fora de escopo; mesma decisão tomada em `GET /bands` e `GET /bands/{bandId}/songs`).
- Alterações de schema — a tabela `band_setlists` e seu índice em `band_id` já existem (migration `1785793468320-create-band-setlists-table`).
- Renomear a rota de cadastro — `POST /bands/{bandId}/setlists` já está no plural, diferente do caso do repertório de músicas.

## Decisions

- **Reaproveitar o `BandSetlistController` existente**, adicionando um handler `@Get(':id/setlists')` na mesma classe, em vez de criar um controller novo. Motivo: a rota compartilha o mesmo recurso (`bands/:id/...`) e os mesmos guards já aplicados no nível da classe; criar um controller separado duplicaria a configuração de guards/tags do Swagger sem benefício.
- **Reaproveitar `FindIdParamDto`** para o parâmetro de rota, mantendo `:id` como nome do parâmetro (mesmo padrão do `POST :id/setlists`), já validado pelo `AuthUserIsMemberBandGuard`. O "bandId" mencionado na proposta é conceitual — na implementação o parâmetro continua se chamando `id`, por consistência com a rota irmã.
- **Novo método `findAllByBandId(bandId: string): Promise<BandSetlistEntity[]>`** em `IBandSetlistRepository`, implementado em `BandSetlistRepository` via `Repository<BandSetlistTypeormEntity>.find({ where: { band_id: bandId }, order: { created_at: 'ASC' } })`. Ordenação por `created_at` ascendente (ordem de criação) foi escolhida por consistência com `BandSongRepository.findAllByBandId`, já validado.
- **Novo `ListBandSetlistsUseCase`** (+ interface `ListBandSetlistsUseCaseInterface`), recebendo apenas `bandId` e delegando para `bandSetlistRepository.findAllByBandId`. Espelha exatamente `ListBandSongsUseCase`.
- **Novos DTOs de resposta** em `src/shared/communication/dtos/band-setlist/`: `BandSetlistResponseDto` (todos os campos de `BandSetlistEntity`: `id`, `band_id`, `name`, `created_at`, `updated_at`, com mapper estático `fromEntity`/`fromEntities`) e `ListBandSetlistsResponseDto` (`{ data: BandSetlistResponseDto[] }`, construído via `fromEntities`). Espelham `BandSongResponseDto`/`ListBandSongsResponseDto`.
- **Novo decorator Swagger `ApiListBandSetlists()`** em `src/http/band-setlist/decorators/`, documentando 200 (`ListBandSetlistsResponseDto`), 401, 403 e 404 — os três últimos já cobertos pelo `AuthUserIsMemberBandGuard` compartilhado com o `POST :id/setlists`.
- **Wiring**: novo token `LIST_BAND_SETLISTS_USE_CASE` em `BandSetlistFactoryModule`, seguindo o mesmo padrão `useFactory` do token de criação já existente.

## Risks / Trade-offs

- [Ausência de paginação pode se tornar um problema para bandas com muitos setlists] → Aceito por ora, mesma decisão já validada em `GET /bands` e `GET /bands/{bandId}/songs`; pode ser revisitado em um change futuro se necessário.
- [Reaproveitar `AuthUserIsMemberBandGuard` significa que a listagem retorna 403 para não-membros, mesmo que a informação de setlists pudesse ser considerada "menos sensível" que o cadastro] → Aceito: manter a mesma política de acesso do endpoint de escrita evita expor os setlists de uma banda a usuários sem nenhum vínculo com ela.
