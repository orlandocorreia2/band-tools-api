## Context

`BandSongController` já existe e concentra as rotas do repertório sob o prefixo `bands`, protegidas por `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)` no nível da classe. O `AuthUserIsMemberBandGuard` já implementa toda a cadeia de validação exigida (parâmetro é UUIDv7 válido → banda existe → usuário autenticado existe → usuário é membro da banda), reutilizada do endpoint `POST /bands/:id/song`. O padrão de resposta `{ "data": [...] }` para listagens já foi estabelecido em `GET /bands` (`ListBandsResponseDto` + `BandResponseDto`), sem interceptor global — cada response DTO de listagem monta o envelope manualmente.

## Goals / Non-Goals

**Goals:**
- Adicionar `GET /bands/{bandId}/songs`, retornando todas as músicas do repertório da banda em `{ data: [...] }`.
- Reaproveitar ao máximo a infraestrutura de autenticação/autorização já existente (`JwtAuthGuard` + `AuthUserIsMemberBandGuard`), sem duplicar lógica de verificação de banda/membro.
- Seguir exatamente o padrão arquitetural já validado em `GET /bands` (use case de leitura, response DTO com mapper estático, decorator Swagger dedicado).

**Non-Goals:**
- Paginação, filtros ou ordenação customizável pelo cliente (fora de escopo; mesma decisão tomada em `GET /bands`).
- Alterações de schema — a tabela `band_songs` e seu índice em `band_id` já existem (migration `1784674324900-create-band-songs-table`).

## Decisions

- **Reaproveitar o `BandSongController` existente**, adicionando um handler `@Get(':id/songs')` na mesma classe, em vez de criar um controller novo. Motivo: a rota compartilha o mesmo recurso (`bands/:id/...`) e os mesmos guards já aplicados no nível da classe; criar um controller separado duplicaria a configuração de guards/tags do Swagger sem benefício.
- **Reaproveitar `FindIdParamDto`** para o parâmetro de rota, mantendo `:id` como nome do parâmetro (mesmo padrão do `POST :id/song`), já validado pelo `AuthUserIsMemberBandGuard`. O "bandId" mencionado na proposta é conceitual — na implementação o parâmetro continua se chamando `id`, por consistência com a rota irmã.
- **Novo método `findAllByBandId(bandId: string): Promise<BandSongEntity[]>`** em `IBandSongRepository`, implementado em `BandSongRepository` via `Repository<BandSongTypeormEntity>.find({ where: { band_id: bandId }, order: { created_at: 'ASC' } })`. Ordenação por `created_at` ascendente (ordem de inclusão no repertório) foi escolhida por ser a ordem mais previsível na ausência de um requisito explícito de ordenação; alternativa considerada — ordenar por `title` — foi descartada por não haver pedido do usuário nesse sentido e por manter consistência com a direção cronológica já usada como base em `findAllByUserId` (que usa `created_at`, ainda que em ordem decrescente para "bandas mais recentes primeiro").
- **Novo `ListBandSongsUseCase`** (+ interface `ListBandSongsUseCaseInterface`), recebendo apenas `bandId` e delegando para `bandSongRepository.findAllByBandId`. Espelha exatamente `ListBandsByUserUseCase`.
- **Novos DTOs de resposta** em `src/shared/communication/dtos/band-song/`: `BandSongResponseDto` (todos os campos de `BandSongEntity`, com mapper estático `fromEntity`/`fromEntities`) e `ListBandSongsResponseDto` (`{ data: BandSongResponseDto[] }`, construído via `fromEntities`). Espelham `BandResponseDto`/`ListBandsResponseDto`.
- **Novo decorator Swagger `ApiListBandSongs()`** em `src/http/band-song/decorators/`, documentando 200 (`ListBandSongsResponseDto`), 401, 403 e 404 — os três últimos já cobertos pelo `AuthUserIsMemberBandGuard` compartilhado com o `POST :id/songs`.
- **Wiring**: novo token `LIST_BAND_SONGS_USE_CASE` em `BandSongFactoryModule`, seguindo o mesmo padrão `useFactory` do token de criação já existente.
- **Renomear a rota de cadastro para o plural (`POST :id/song` → `POST :id/songs`)**, unificando o nome do recurso entre as duas rotas irmãs. Motivo: manter duas rotas para o mesmo recurso com nomes diferentes (singular no cadastro, plural na listagem) seria uma inconsistência permanente e confusa para os consumidores da API; como o projeto ainda está em `0.x` (pré-1.0), o custo de uma mudança **BREAKING** agora é menor do que carregar essa inconsistência indefinidamente. Alternativa considerada — manter o singular no cadastro — foi descartada por essa razão.

## Risks / Trade-offs

- [Renomear `POST :id/song` para `POST :id/songs` é uma mudança **BREAKING** para qualquer consumidor já integrado] → Aceito: o projeto está em `0.x`, sem consumidores em produção conhecidos além do próprio time; o CHANGELOG e a versão `npm` marcam a mudança explicitamente.
- [Ausência de paginação pode se tornar um problema para bandas com repertórios muito grandes] → Aceito por ora, mesma decisão já validada em `GET /bands`; pode ser revisitado em um change futuro se necessário.
- [Reaproveitar `AuthUserIsMemberBandGuard` significa que a listagem retorna 403 para não-membros, mesmo que a informação de repertório pudesse ser considerada "menos sensível" que o cadastro] → Aceito: manter a mesma política de acesso do endpoint de escrita evita expor o repertório de uma banda a usuários sem nenhum vínculo com ela.
