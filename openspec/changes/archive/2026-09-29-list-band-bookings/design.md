## Context

O cadastro de agendamentos já existe (`BandBookingController.create`, `CreateBandBookingUseCase`, `BandBookingRepository.save`). A tabela `band_bookings` tem índice em `band_id` e em `contact_id`, e `contact_id` é FK para `user_contacts` com `ON DELETE CASCADE`. Por isso todo agendamento persistido aponta para um contato existente.

Os contatos pertencem a um usuário (`user_contacts.user_id`), e não à banda. No cadastro, o `CreateBandBookingUseCase` exige que o contato seja do usuário autenticado. Na listagem, qualquer membro da banda vê os agendamentos, inclusive os cadastrados por outros membros com contatos desses outros membros.

A listagem de músicas do setlist (`ListSetlistSongsUseCase`) já resolve um problema igual: busca os registros principais, depois as entidades relacionadas em lote via `findAllByIds`, e devolve pares para o DTO. Esta mudança segue o mesmo padrão.

`BandBookingTypeormEntity` usa `dateColumnTransformer` (a coluna `date` volta como `Date` em UTC 00:00) e `feeColumnTransformer` (a coluna `fee` volta como `number`). Os repositórios devolvem a linha do TypeORM direto como entidade de domínio, sem passar pelo construtor de `BandBookingEntity`. Isso importa porque o construtor força `status = Pending`.

Motivação: ver proposal.md, seção Why. Requisitos: ver `specs/band-bookings/spec.md`.

## Goals / Non-Goals

**Goals:**
- `GET /bands/:id/bookings` com o mesmo AuthN/AuthZ do cadastro.
- Resposta `{ data: [...] }` com o agendamento completo e o `contact` aninhado.
- Duas queries por requisição (agendamentos + contatos em lote), sem N+1.
- Manter 100% de cobertura unitária.

**Non-Goals:**
- Paginação, filtros (`status`, período, só futuros) ou busca.
- Detalhe de um agendamento (`GET /bands/:id/bookings/:bookingId`), edição, cancelamento ou troca de status.
- Mudar o modelo de posse dos contatos (continuam por usuário).
- Migrations ou mudanças de schema.

## Decisions

### Contatos em lote no use case, e não via relation/join do TypeORM
`ListBandBookingsUseCase` chama `bandBookingRepository.findAllByBandId(bandId)`, extrai os `contact_id` distintos e chama `contactRepository.findAllByIds(ids)` uma vez. Depois monta `BandBookingWithContact[]` (`{ bandBooking, contact }`), igual ao `SetlistSong` do setlist. Se não houver agendamentos, não consulta contatos.
**Alternativa considerada:** declarar `@ManyToOne` de `BandBookingTypeormEntity` para `ContactTypeormEntity` e usar `relations: { contact: true }`. Rejeitada porque vazaria a entidade TypeORM do contato para o domínio (o repositório devolve a linha direto), acoplaria dois agregados na infraestrutura e fugiria do padrão já usado no projeto. O custo é uma query a mais, indexada por PK.

### `findAllByIds` de contatos sem filtro por `user_id`
Diferente de `findByIdAndUserId`, o novo método não filtra por dono, porque o contato pode ser de outro membro da banda. Isso é seguro porque os IDs **nunca vêm do cliente**: saem só dos agendamentos da banda cujo acesso o `AuthUserIsMemberBandGuard` já validou. O método fica documentado na interface como "uso interno, IDs de origem confiável". Não deve ser exposto a nenhum input do usuário, para evitar IDOR.

### Autorização reaproveitando o guard da classe
O `BandBookingController` já tem `@UseGuards(JwtAuthGuard, AuthUserIsMemberBandGuard)` no nível da classe, então o novo `@Get()` herda validação de UUID v7, existência de banda e usuário e vínculo de membro. O repositório filtra por `band_id` igual ao `:id` da rota, e o id da banda nunca vem do corpo ou da query. Resultado: fail secure, porque se o guard falhar nada é consultado.

### Ordenação no repositório
`findAllByBandId` usa `order: { date: 'ASC', start_time: 'ASC', created_at: 'ASC' }`. `start_time` é `varchar(5)` no formato `HH:mm` com zero à esquerda (validado no DTO), então a ordem lexicográfica é igual à cronológica. `created_at` é só desempate estável.

### `BandBookingResponseDto` com `contact: BandBookingContactResponseDto`
Construtor privado + `fromEntity`/`fromEntities`, recebendo o par `{ bandBooking, contact }`, igual a `SetlistSongResponseDto`. `ListBandBookingsResponseDto` embrulha em `data`, igual às outras listagens.
- O item não expõe `band_id` (já é o `:id` da rota) nem `contact_id` (já é o `contact.id`), para evitar redundância no payload.
- O `contact` usa um DTO próprio, `BandBookingContactResponseDto`, com `id`, `name`, `phone`, `alternate_phone`, `venue_name`, `address`, `email`, `role` e `notes`, sem `user_id`, `created_at` e `updated_at`. `alternate_phone` e `notes` usam `?? null`, pelo mesmo motivo dos opcionais do agendamento.
**Alternativa considerada:** reutilizar `ContactResponseDto`. Rejeitada porque ele traz as datas do contato, que não servem para a agenda, e alterá-lo mudaria o contrato de `GET /users/contacts`.
- `date`: serializado como `YYYY-MM-DD` (UTC getters, mesma lógica de `dateColumnTransformer.to`), para bater com o formato do cadastro e evitar que o cliente veja `2026-12-20T00:00:00.000Z` e aplique fuso. Para não duplicar a lógica, extrair um helper `formatDateOnly(date: Date): string` em `src/shared/helpers/` e usar nos dois lugares.
- `consumption`, `link`, `note`: `?? null`, tipados `string | null`, `@ApiPropertyOptional({ nullable: true })`.
- `status`: tipado como `BandBookingStatusEnum`, documentado com `enum` no Swagger.
**Alternativa considerada:** projeção plana (campos do contato achatados no item). Rejeitada porque o pedido explicita a chave `contact`, e `id`/`created_at`/`updated_at` colidiriam.

### Status vem da persistência, não do construtor
O repositório devolve a linha do TypeORM, então `status` reflete o valor gravado. O teste de unidade do repositório e o cenário e2e "Status diferente de Pending" garantem isso. Nesta mudança o construtor de `BandBookingEntity` não muda.

### Contato ausente (defensivo)
A FK com `ON DELETE CASCADE` garante que o contato existe. Mesmo assim, o use case não pode quebrar com `undefined`. Se o contato de um agendamento não for encontrado, esse agendamento é **omitido** da resposta.
**Alternativas consideradas:** retornar `contact: null` (rejeitada porque quebra o contrato do item) e lançar erro 500 (rejeitada porque um único registro inconsistente derrubaria a agenda inteira). O cenário não acontece com o schema atual e fica coberto só em teste unitário.

## Risks / Trade-offs

- **[Exposição de PII de contato para todos os membros da banda (LGPD)]** Telefone, e-mail e endereço de um contato cadastrado pelo membro A passam a ser visíveis para o membro B. → Aceito como regra de negócio: o contato é o ponto focal do show da banda, e todos os membros precisam dele para se organizar. Mitigações: (1) só membros validados pelo guard acessam; (2) `user_id` do contato não é exposto; (3) a resposta não deve ser logada por nenhum interceptor ou logger (payload com PII); (4) o cliente Flutter não deve persistir essa resposta em `SharedPreferences` nem em cache não criptografado. **Validar com o PO/DPO** se o aviso de compartilhamento precisa aparecer no cadastro de contato.
- **[Sem paginação]** Payload cresce com o histórico de shows. → Aceito para o volume atual de uma banda (dezenas a poucas centenas de agendamentos). Paginação ou filtro de período ficam para proposta futura.
- **[`findAllByIds` sem escopo de dono pode ser mal reutilizado]** → Comentário na interface e revisão de código. Se surgir outro uso, criar uma variante com escopo.
- **[Divergência de formato de `date` entre endpoints]** → Mitigado com o helper compartilhado.

## Migration Plan

Nenhuma migration de banco. Deploy comum. Rollback: reverter o commit. Clientes que passarem a consumir o endpoint deixam de ter a agenda até a nova versão subir.

## Open Questions

- O compartilhamento dos dados de contato entre membros da banda precisa de consentimento ou aviso explícito no app (LGPD, art. 7º)? Não bloqueia a implementação, mas deve ser resolvido antes do release em produção.
