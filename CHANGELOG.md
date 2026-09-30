### band-tools

### Controle de versionamento e atualizações da api:

### [Version - 0.19.0] - 2026-09-29

#### Feat

- Listagem dos agendamentos de uma banda (`GET /bands/:id/bookings`), protegida por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: apenas membros da banda acessam; `:id` inválido retorna 422, banda ou usuário inexistente 404, não membro 403 (sem expor dados de agendamentos ou contatos)
- Resposta no envelope `{ "data": [...] }` já adotado nas demais listagens; cada item traz `id`, `title`, `date` (`YYYY-MM-DD`, mesmo formato do cadastro), `start_time`, `duration`, `fee` (numérico), `status` persistido, `consumption`, `link`, `note`, `created_at`, `updated_at` e o objeto aninhado `contact` (`id`, `name`, `phone`, `alternate_phone`, `venue_name`, `address`, `email`, `role`, `notes`)
- `band_id` e `contact_id` não são expostos no item por serem redundantes (`:id` da rota e `contact.id`); o `contact` não expõe `user_id`, `created_at` nem `updated_at`; campos opcionais não preenchidos são retornados como `null`, mantendo um contrato estável para os clientes
- Todos os agendamentos da banda são retornados, de qualquer `status` e incluindo datas passadas, em ordem cronológica (`date` ASC, `start_time` ASC, `created_at` ASC como desempate), sem paginação
- `IBandBookingRepository` ganha `findAllByBandId(bandId)` e `IContactRepository` ganha `findAllByIds(ids)` (`In(ids)`); `ListBandBookingsUseCase` busca os contatos em lote com IDs deduplicados (2 queries por requisição, sem N+1), usando apenas IDs dos agendamentos da banda já autorizada pelo guard, nunca IDs vindos do cliente (evita IDOR)
- Novos `BandBookingResponseDto`, `BandBookingContactResponseDto` e `ListBandBookingsResponseDto`; `ContactResponseDto` e `GET /users/contacts` não foram alterados
- Novo helper `formatDateOnly` (`src/shared/helpers/`), reutilizado pelo `dateColumnTransformer` de `BandBookingTypeormEntity`; nenhuma alteração de schema (sem migration)
- Testes unitários com 100% de cobertura, testes de componente (200 com contato aninhado, lista vazia, 401, 422, 404 e 403) e testes e2e no banco efêmero cobrindo campos retornados, opcionais `null`, ordenação, isolamento entre bandas, contato cadastrado por outro membro, `status` diferente de `Pending`, 401, 403, 404 e 422

#### Security

- Os dados do contato (telefone, e-mail e endereço) passam a ser visíveis para todos os membros da banda, e não apenas para o usuário que cadastrou o contato; pendente de validação com PO/DPO quanto à necessidade de aviso ou consentimento (LGPD) antes do release em produção

### [Version - 0.18.0] - 2026-09-29

#### Chore

- Testes e2e passam a rodar contra um PostgreSQL real e efêmero via Testcontainers (`@testcontainers/postgresql`, imagem `postgres:16-alpine`, a mesma do `docker-compose.dev.yml`): o `globalSetup` sobe o container, roda as migrations versionadas em um banco template e clona um banco por worker do Jest (`band_tools_test_<JEST_WORKER_ID>`) via `CREATE DATABASE ... TEMPLATE`; o `globalTeardown` destrói o container
- Os e2e deixam de ler e gravar no banco de desenvolvimento (`band_tools_db`), eliminando o acúmulo de dados de teste e o risco de manipular dados pessoais caso o banco de dev receba um dump (LGPD)
- Credenciais do banco de teste efêmeras: a senha do container é gerada com `crypto.randomBytes` a cada execução; `test/setEnvVars.js` passa a usar `??=` nas variáveis `DB_*`, mantendo apenas placeholders para os testes unitários
- Novo helper `truncateAllTables` (`TRUNCATE ... RESTART IDENTITY CASCADE`) executado no `afterAll` de todas as suites e2e, com trava que recusa rodar em bancos fora do prefixo `band_tools_test_`
- Nova camada de testes de componente (`npm run test:component`, `test/component/**/*.component-spec.ts`): sobe o `AppModule` real (controllers, guards, pipes e filtros) com repositórios em memória que implementam as interfaces de `src/domain/repositories/`, sem banco e sem Docker, para feedback rápido de contratos HTTP, validação e AuthN/AuthZ; não substitui os e2e
- Requisitos do ambiente de desenvolvimento: Node `>= 22.22` (`.nvmrc` atualizado para `v22.23.3` e `engines` declarado no `package.json`) e Docker em execução para `npm run test:e2e`; o `globalSetup` falha com mensagem explicativa quando o Node está abaixo da versão mínima ou o Docker não responde

#### Refactor

- Novo `PersistenceModule` (`src/infrastructure/persistence/`) como ponto único de wiring dos 8 repositórios TypeORM; `BandFactoryModule`, `UserFactoryModule`, `AuthFactoryModule`, `ContactFactoryModule` e `HttpModule` passam a importá-lo em vez de declarar repositórios e `TypeOrmModule.forFeature` localmente
- As próprias classes de repositório continuam sendo os tokens de DI, sem alteração em use cases, controllers ou guards; nenhuma mudança de comportamento da API e nenhuma migration
- Testes unitários com 100% de cobertura (`PersistenceModule` e factory modules atualizados), 133 cenários e2e passando no banco efêmero e testes de componente cobrindo `POST /bands` (201 com owner registrado, 401 sem token, 400 sem `name`) e a ausência de conexão com banco

### [Version - 0.17.0] - 2026-09-28

#### Feat

- `GET /bands/:id/setlists/:setlistId/songs` passa a retornar, em cada item, os detalhes da música vindos de `band_songs` além do `title`: `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes`, deixando o setlist autossuficiente para uso em ensaios e shows sem precisar cruzar com `GET /bands/:id/songs`
- Os novos campos seguem a projeção plana já usada no item (sem aninhar um objeto `band_song`) e estão sempre presentes na resposta: quando não preenchidos na música, são retornados como `null`, mantendo um contrato estável para os clientes
- `band_id`, `created_at` e `updated_at` da música não são expostos: `band_id` já é o `:id` da rota, e `created_at`/`updated_at` do item continuam sendo as datas do vínculo em `band_setlist_songs`
- `SetlistSongResponseDto` documenta os seis campos no Swagger como `nullable`; nenhuma alteração de use case, repositório ou schema (sem migration)
- Mudança aditiva, sem breaking change: nenhum campo existente foi removido ou renomeado
- Testes unitários com 100% de cobertura do DTO (músicas com e sem detalhes preenchidos) e testes e2e cobrindo música com todos os detalhes, música apenas com `title` (campos `null`), ausência de `band_id` e datas pertencentes ao vínculo

### [Version - 0.16.0] - 2026-08-21

#### Feat

- `POST /bands/:id/bookings` passa a receber `contact_id` (UUID de um contato já cadastrado em `POST /users/contacts`) em vez de duplicar `focal_point_name`/`phone`/`address` como campos próprios do agendamento
- Migration alterando `band_bookings`: remove as colunas `focal_point_name`, `phone` e `address`; adiciona `contact_id uuid NOT NULL` com índice dedicado e foreign key para `user_contacts.id` (`ON DELETE RESTRICT`, para não deixar agendamentos com referência órfã caso uma futura feature de exclusão de contato seja implementada)
- `IContactRepository` ganha `findByIdAndUserId(id, userId)`, implementado em `ContactRepository` via `findOneBy({ id, user_id })`
- `CreateBandBookingUseCase` passa a receber o `userId` autenticado e valida, antes de persistir, que o `contact_id` informado corresponde a um contato existente e pertencente a esse usuário; contato inexistente ou pertencente a outro usuário retorna HTTP 404, sem revelar se o `contact_id` corresponde a um contato de outra pessoa (evita IDOR)
- Testes unitários com 100% de cobertura e testes e2e cobrindo criação com contato válido, `contact_id` ausente/em formato inválido (422), contato inexistente (404) e contato de outro usuário (404)

#### Breaking

- `POST /bands/:id/bookings` não aceita mais `focal_point_name`, `phone` nem `address` no corpo da requisição; clientes devem cadastrar o contato via `POST /users/contacts` e enviar o `contact_id` retornado

### [Version - 0.15.0] - 2026-08-21

#### Feat

- Listagem dos contatos do usuário autenticado (`GET /users/contacts`), protegida por `JwtAuthGuard`: retorna, sem paginação, apenas os contatos cujo `user_id` corresponda ao usuário autenticado, ordenados por `created_at` decrescente
- `IContactRepository` ganha `findAllByUserId(userId)`, implementado em `ContactRepository` filtrando por `user_id` e ordenado por `created_at DESC`
- `ListContactsByUserUseCase`, seguindo o mesmo padrão já adotado em `ListBandsByUserUseCase`
- `ContactResponseDto` e `ListContactsResponseDto`, seguindo o mesmo padrão de envelope `{ "data": [...] }` já adotado em `GET /bands`
- O filtro por usuário usa exclusivamente o `user_id` extraído do JWT (`request.user.id`), nunca um parâmetro vindo do cliente, prevenindo acesso aos contatos de outros usuários (IDOR)
- Testes unitários com 100% de cobertura e testes e2e cobrindo listagem com contatos cadastrados, listagem vazia, isolamento entre usuários e requisição sem token (401)

### [Version - 0.14.0] - 2026-08-12

#### Feat

- Cadastro de contatos de shows e eventos vinculados ao usuário autenticado (`POST /users/contacts`), protegido por `JwtAuthGuard`: recebe `name`, `phone`, `venue_name`, `address`, `email`, `role` (obrigatórios) e `alternate_phone`, `notes` (opcionais), persistindo o contato na nova tabela `user_contacts`
- Migration `create-user-contacts-table`: `user_id` como foreign key para `users.id` (`ON DELETE CASCADE`) e índice dedicado em `user_id`; relação 1:N — um usuário pode ter vários contatos, e cada contato pertence a exatamente um usuário
- `ContactEntity`, `IContactRepository`, `ContactTypeormEntity` e `ContactRepository`, seguindo o mesmo padrão em camadas já adotado nos demais cadastros
- `phone`/`alternate_phone`: mesma regra já usada em `POST /bands/:id/bookings` — somente dígitos, sem máscara, 10 caracteres (fixo) ou 11 (celular)
- `name`, `venue_name` e `role` seguem o mesmo padrão de validação de nome já usado em `title`/`focal_point_name` de `POST /bands/:id/bookings`; `email` segue o mesmo padrão já usado no cadastro de usuário
- A relação entre contato e banda (vínculo automático ao ser selecionado em um cadastro de evento/booking) fica para uma mudança futura; esta primeira etapa cobre apenas o vínculo com o usuário
- Testes unitários com 100% de cobertura e testes e2e cobrindo cadastro com campos obrigatórios/opcionais, ausência de cada campo obrigatório e telefone/e-mail inválidos (422), e requisição sem token (401)

### [Version - 0.13.0] - 2026-08-08

#### Feat

- Cadastro de agendamento de show/evento de uma banda (`POST /bands/:id/bookings`), protegido por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: recebe `title`, `focal_point_name`, `phone`, `date`, `start_time`, `duration`, `address`, `fee` (obrigatórios) e `consumption`, `link`, `note` (opcionais), persistindo o agendamento na nova tabela `band_bookings`
- Migration `create-band-bookings-table`: `band_id` como foreign key para `bands.id` (`ON DELETE CASCADE`) e índice dedicado em `band_id`
- `BandBookingEntity`, `IBandBookingRepository`, `BandBookingTypeormEntity` e `BandBookingRepository`, seguindo o mesmo padrão em camadas já adotado nos demais cadastros
- `phone`: somente dígitos, sem máscara — 10 caracteres (fixo) ou 11 (celular, com o dígito 9)
- `fee`: cachê em reais, aceita `0` (show gratuito), limitado ao intervalo `[0, 99999999.99]` com no máximo 2 casas decimais — teto e precisão espelham exatamente a capacidade da coluna `numeric(10,2)`, evitando tanto overflow do banco (que vazaria como HTTP 500 genérico) quanto arredondamento silencioso de valores com mais casas decimais
- `status`: novo enum `BandBookingStatusEnum` (`Pending`, `Confirmed`, `Cancelled`); todo agendamento é criado com `status = Pending` — o campo não é aceito no payload de criação (descartado pelo `ValidationPipe` com `whitelist: true`) e nenhuma transição de status é exposta nesta primeira etapa
- Validação de que a combinação `date` + `start_time` representa um instante futuro em relação ao momento do cadastro, tratando ambos como horário de Brasília (UTC-3, fixo, sem horário de verão desde 2019) de forma independente do fuso horário do processo Node — tanto na regra de negócio (`CreateBandBookingUseCase`) quanto na persistência da própria coluna `date` (`dateColumnTransformer`, que substitui a serialização padrão do TypeORM para colunas `date`, a qual usa getters de fuso local e persistiria o dia errado em processos rodando fora de UTC)
- `duration` como campo de texto livre para a duração do show (ex.: "1 hora", "40 minutos"); `link` genérico para a página do evento/casa de show (Instagram, site ou outra), sem enviesar para uma rede social específica
- Testes unitários com 100% de cobertura e testes e2e cobrindo cadastro com campos obrigatórios/opcionais, show gratuito, telefone/link/fee inválidos (incluindo telefone mascarado, fee acima da capacidade da coluna e fee com mais de 2 casas decimais), status enviado pelo cliente sendo ignorado, data passada e data atual com horário já passado/ainda futuro, banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)

### [Version - 0.12.0] - 2026-08-03

#### Feat

- Listagem das músicas de um setlist (`GET /bands/:id/setlists/:setlistId/songs`), protegida por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: retorna, sem paginação, os vínculos do setlist ordenados por `position` ascendente
- Validação de que o setlist (`:setlistId`) existe e pertence à banda (`:id`) antes de listar, reaproveitando o mesmo padrão de verificação já usado em `AddSongToSetlistUseCase` (HTTP 404 quando inexistente ou pertencente a outra banda)
- `IBandSongRepository` ganha `findAllByIds(ids)`, implementado via `In(ids)` para buscar em uma única consulta os nomes das músicas do setlist, evitando N+1
- `ListSetlistSongsUseCase`, o primeiro caso de uso do domínio de bandas a compor dados de duas entidades (`BandSetlistSongEntity` + `BandSongEntity`) em uma única resposta
- Resposta em envelope `{ "data": [...] }` com um objeto plano por item: `id` (do vínculo em `band_setlist_songs`), `band_setlist_id`, `band_song_id`, `position`, `title` (nome da música) e `created_at`/`updated_at` do vínculo
- Testes unitários com 100% de cobertura e testes e2e cobrindo listagem ordenada por `position`, setlist sem músicas, setlist inexistente (404), setlist pertencente a outra banda (404), banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)

#### Refactor

- `BandSongController`, `BandSetlistController` e `BandSetlistSongController` passam a seguir o padrão de resource controller: o prefixo completo do recurso (`bands/:id/songs`, `bands/:id/setlists`, `bands/:id/setlists/:setlistId/songs`) migra para `@Controller()`, e os handlers usam `@Get()`/`@Post()` sem repetir o caminho

### [Version - 0.11.0] - 2026-08-03

#### Feat

- Associação de músicas do repertório a um setlist (`POST /bands/:id/setlists/:setlistId/songs`), protegida por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: recebe `bandSongId` (UUID v7 da música em `band_songs`) e `position`, persistindo o vínculo na nova tabela `band_setlist_songs`
- Migration `create-band-setlist-songs-table`: `band_setlist_id` e `band_song_id` como foreign keys (`ON DELETE CASCADE`) para `band_setlists.id`/`band_songs.id`, com índice dedicado em `band_setlist_id`
- Validação de que o setlist (`:setlistId`) e a música (`bandSongId`) existem e pertencem à banda (`:id`) informada na rota, retornando HTTP 404 em qualquer um dos dois casos, com novo método `findById` em `IBandSetlistRepository`/`IBandSongRepository`
- Reposicionamento automático de `position`: quando o valor informado já está em uso por outro vínculo do mesmo setlist, o sistema ignora o valor enviado e persiste a música na última posição (`MAX(position) + 1`); sem colisão, a `position` informada é usada como enviada
- A mesma música pode ser associada mais de uma vez ao mesmo setlist (ex.: bis) — sem validação de unicidade de `bandSongId`
- `BandSetlistSongEntity`, `IBandSetlistSongRepository` (`save`, `findAllByBandSetlistId`), `BandSetlistSongTypeormEntity`, `BandSetlistSongRepository` e `AddSongToSetlistUseCase`, seguindo o mesmo padrão em camadas já adotado nos demais cadastros
- Testes unitários com 100% de cobertura e testes e2e cobrindo cadastro com sucesso, corpo malformado (400), `bandSongId`/`position` ausentes ou inválidos (422), banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403), requisição sem token (401), setlist/música inexistentes ou pertencentes a outra banda (404), duplicidade de música e colisão de `position`

#### Refactor

- Consolidadas as pastas `band-setlist/`, `band-song/` e `band-member/` dentro de uma única pasta `band/` em cada camada (`domain/entities`, `domain/repositories`, `infrastructure/entities`, `infrastructure/repository`, `application/usecase` — incluindo o barrel `interfaces/index.ts` unificado — `shared/communication/dtos` e `http`), já que banda, setlist, repertório de músicas e membros fazem parte do mesmo contexto de domínio; nomes de arquivo/classe permanecem os mesmos, apenas a localização física muda
- Unificados os três factory modules HTTP (`BandFactoryModule`, `BandSetlistFactoryModule`, `BandSongFactoryModule`) em um único `BandFactoryModule`, que passa a expor todos os tokens de caso de uso de banda, setlist e repertório, com um único `TypeOrmModule.forFeature([...])` e um único `forRoot()`

### [Version - 0.10.0] - 2026-08-03

#### Feat

- Listagem dos setlists de uma banda (`GET /bands/:id/setlists`), protegida por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: retorna, sem paginação, todos os setlists cadastrados para a banda informada
- `IBandSetlistRepository` ganha `findAllByBandId(bandId)`, implementado em `BandSetlistRepository` filtrando por `band_id` e ordenado por `created_at ASC`
- `ListBandSetlistsUseCase`, o primeiro caso de uso de leitura do domínio de setlists
- `BandSetlistResponseDto` e `ListBandSetlistsResponseDto`, seguindo o mesmo padrão de envelope `{ "data": [...] }` já adotado em `GET /bands/:id/songs`
- Testes unitários com 100% de cobertura e testes e2e cobrindo banda com setlists, listagem vazia, exclusão de setlists de outras bandas, banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)

### [Version - 0.9.0] - 2026-08-03

#### Feat

- Cadastro de setlist de uma banda (`POST /bands/:id/setlists`), protegido por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: recebe `name` e persiste o setlist na nova tabela `band_setlists`
- Migration `create-band-setlists-table`: `band_id` como foreign key para `bands.id` (`ON DELETE CASCADE`) e índice dedicado em `band_id`
- `BandSetlistEntity`, `IBandSetlistRepository`, `BandSetlistTypeormEntity` e `BandSetlistRepository` na camada de domínio/infraestrutura
- `CreateBandSetlistUseCase`, `CreateBandSetlistDto` e `ApiCreateBandSetlist` (documentação Swagger), seguindo o mesmo padrão já adotado em `POST /bands/:id/songs`
- Testes unitários com 100% de cobertura e testes e2e cobrindo cadastro com sucesso, corpo malformado (400), `name` ausente/vazio (422), `id` de banda inválido (422), banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)
- A associação de músicas do repertório a um setlist (tabela de junção, ordenação) fica para uma mudança futura; este cadastro inicial contempla apenas o nome do setlist vinculado à banda

### [Version - 0.8.0] - 2026-08-02

#### Feat

- Listagem das músicas do repertório de uma banda (`GET /bands/:id/songs`), protegida por `JwtAuthGuard` + `AuthUserIsMemberBandGuard`: retorna, sem paginação, todas as músicas cadastradas para a banda informada
- `IBandSongRepository` ganha `findAllByBandId(bandId)`, implementado em `BandSongRepository` filtrando por `band_id` e ordenado por `created_at ASC`
- `ListBandSongsUseCase`, o primeiro caso de uso de leitura do domínio de repertório
- `BandSongResponseDto` e `ListBandSongsResponseDto`, seguindo o mesmo padrão de envelope `{ "data": [...] }` já adotado em `GET /bands`
- Testes unitários com 100% de cobertura e testes e2e cobrindo banda com músicas, repertório vazio, exclusão de músicas de outras bandas, banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)

#### Breaking

- Renomeado o endpoint de cadastro de música de `POST /bands/:id/song` (singular) para `POST /bands/:id/songs` (plural), unificando o nome do recurso com o novo endpoint de listagem; a rota antiga não existe mais e passa a retornar HTTP 404

### [Version - 0.7.0] - 2026-07-31

#### Feat

- Listagem das bandas do usuário autenticado (`GET /bands`), protegida por `JwtAuthGuard`: retorna, sem paginação, todas as bandas vinculadas ao usuário via `band_members` (dono ou membro comum, indistintamente)
- `IBandRepository` ganha `findAllByUserId(userId)`, implementado em `BandRepository` como join entre `bands` e `band_members` filtrado por `user_id` e ordenado por `created_at DESC`
- `ListBandsByUserUseCase`, o primeiro caso de uso de leitura do projeto
- `BandResponseDto` e `ListBandsResponseDto`, os primeiros response DTOs do projeto: a resposta segue o formato de envelope `{ "data": [...] }`, com o array de bandas na chave `data`
- Testes unitários com 100% de cobertura e testes e2e cobrindo bandas próprias e de participação, usuário sem nenhuma banda, requisição sem autenticação (401) e exclusão de bandas pertencentes apenas a outros usuários

### [Version - 0.6.0] - 2026-07-31

#### Feat

- Cadastro de música no repertório de uma banda (`POST /bands/:id/song`): campo `title` obrigatório e `tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes` opcionais, persistidos na nova tabela `band_songs`
- Migration `create-band-songs-table`: `band_id` como foreign key para `bands.id` (`ON DELETE CASCADE`) e índice dedicado em `band_id`
- `BandSongEntity`, `IBandSongRepository`, `BandSongTypeormEntity` e `BandSongRepository` na camada de domínio/infraestrutura
- `AuthUserIsMemberBandGuard`, aplicado em conjunto com `JwtAuthGuard`, responsável por validar nesta ordem: existência da banda (`IBandRepository.findById`, 404), existência do usuário autenticado (`IUserRepository.findBy`, 404) e vínculo de membership (`IBandMemberRepository.existsByBandAndUser`, 403), antes de liberar o cadastro
- `IBandRepository` ganha `findById(id)`; `IBandMemberRepository` ganha `existsByBandAndUser(bandId, userId)`
- Testes unitários com 100% de cobertura e testes e2e cobrindo cadastro com sucesso (somente obrigatório e completo), corpo malformado (400), campo obrigatório ausente/inválido (422), `id` de banda inválido (422), banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403) e requisição sem token (401)

#### Refactor

- Decorators Swagger de `POST /bands` extraídos para `ApiCreateBand` (`src/http/band/decorators/`), seguindo o mesmo padrão adotado em `POST /bands/:id/song` (`ApiCreateBandSong`)

### [Version - 0.5.0] - 2026-07-21

#### Feat

- Vínculo automático de dono ao cadastrar uma banda (`POST /bands`): o usuário autenticado passa a ser registrado como dono (`is_owner = true`) em `band_members`, a nova tabela pivô do relacionamento N:N entre `users` e `bands`
- Migration `create-band-members-table`: chave primária composta (`band_id`, `user_id`), foreign keys para `bands.id`/`users.id` com `ON DELETE CASCADE` e índice dedicado em `user_id` para buscas por usuário
- `BandMemberEntity`, `IBandMemberRepository`, `BandMemberTypeormEntity` e `BandMemberRepository` na camada de domínio/infraestrutura
- `IBandRepository.saveWithOwner`: persiste a banda e o vínculo de dono em uma única transação (`DataSource.transaction()`), com rollback conjunto caso qualquer uma das duas gravações falhe
- `CreateBandUseCase` passa a validar se o usuário autenticado (`sub` do JWT) ainda existe em `users` antes de criar a banda, retornando HTTP 404 em vez de um erro de constraint do banco quando o registro do usuário foi excluído após a emissão do token
- `IUserRepository`/`UserFilter` ganham suporte a busca por `id`
- Testes unitários com 100% de cobertura e testes e2e cobrindo o vínculo automático de dono, o cascade de exclusão de `band_members` e o cenário de usuário excluído com token ainda válido

#### Refactor

- Removido o método `save` de `IBandRepository`/`BandRepository`, que ficou sem uso após `CreateBandUseCase` passar a depender exclusivamente de `saveWithOwner`; `BandRepository` não injeta mais `Repository<BandTypeormEntity>`, apenas `DataSource`

### [Version - 0.4.0] - 2026-07-21

#### Feat

- Autenticação de usuário (`POST /auth/login`): recebe `email` e `password`, localiza o usuário e compara a senha contra o hash `bcrypt` armazenado via `IPasswordHasher.compare`
- Emissão de JWT assinado (`accessToken`) em caso de sucesso, com payload `{ sub: user.id, email: user.email }`; expiração/segredo configuráveis via `JWT_SECRET`/`JWT_EXPIRES_IN`
- `JwtAuthGuard` (`CanActivate`) para proteger rotas individualmente via `@UseGuards(JwtAuthGuard)`, extraindo e validando o token do header `Authorization: Bearer <token>` e anexando `id`/`email` do usuário autenticado à requisição; rotas sem o guard permanecem públicas
- Guard aplicado em `POST /bands` como primeira rota protegida
- Validações via `class-validator` e documentação Swagger (`@ApiBearerAuth`) para o novo endpoint e para `POST /bands`
- Testes unitários com 100% de cobertura e testes e2e para login e para o acesso protegido a `POST /bands`

### [Version - 0.3.0] - 2026-07-02

#### Feat

- Cadastro de usuário (`POST /users`): criação de `UserEntity`, `CreateUserDto`, `CreateUserUseCase`, `UserTypeormEntity`, `UserRepository` e migration da tabela `users`
- Campos obrigatórios: `first_name`/`last_name` (2 a 100 caracteres), `email` (único, formato válido, até 254 caracteres), `phone` (8 a 11 caracteres, DDD + número local, sem prefixo de país), `password` (8 a 72 caracteres, com ao menos uma letra e um número); campo `avatar` reservado (`text`, nullable) para uma futura implementação de upload
- Senha protegida por hash `bcrypt` (nunca retornada em nenhuma resposta da API); custo do hash configurável via a nova variável de ambiente `BCRYPT_SALT_ROUNDS`
- Rejeição de e-mail duplicado com HTTP 409 (`IUserRepository.findBy`)
- Validações via `class-validator` e documentação Swagger para o endpoint
- Testes unitários com 100% de cobertura e testes e2e para o cadastro de usuário

#### Fix

- Scripts `migration:*` do `package.json` apontavam para um caminho inexistente (`src/infrastructure/database/`); corrigidos para `src/infrastructure/typeorm/`
- `DB_SYNCHRONIZE`/`DB_AUTO_LOAD_ENTITIES` eram sempre interpretados como `true` por um bug de conversão booleana no `class-transformer`; corrigido com `@Transform` explícito lendo o valor bruto da variável de ambiente
- Validação numérica de `PORT`/`DB_PORT`/`BCRYPT_SALT_ROUNDS` corrigida com `@Type(() => Number)` explícito, evitando depender de metadata refletida (desligada de propósito nos testes)

### [Version - 0.2.0] - 2026-07-01

#### Feat

- Cadastro de banda (`POST /bands`): criação de `BandEntity`, `CreateBandDto`, `CreateBandUseCase`, `BandTypeormEntity`, `BandRepository` e migration da tabela `bands`
- Campos obrigatórios: `name`, `genre` (string livre), `state`, `city`, `neighborhood`, `address`, `started_at`; campos opcionais: `description`, `image`
- Validações via `class-validator` e documentação Swagger para o endpoint
- Testes unitários com 100% de cobertura e testes e2e para o cadastro de banda

### [Version - 0.1.0] - 2026-05-31

#### Chore

- Estrutura e configuração inicial do projeto
- Criação do endpoint /health
- Testes unitários com 100% de cobertura
