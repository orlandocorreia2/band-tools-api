## Context

O projeto já possui um padrão consolidado para recursos filhos que pertencem a exatamente uma entidade "pai" através de uma FK simples, sem tabela pivô: `band_bookings` (`src/infrastructure/entities/band/band-booking-typeorm.entity.ts`) tem `id uuid` gerado na camada de aplicação, coluna `band_id uuid` com `onDelete: CASCADE` e índice nomeado `IDX_band_bookings_band_id`. Esse é o modelo de referência para o novo recurso `Contact`, que pertence a exatamente um usuário (`user_id`, obrigatório). A tabela recebe o nome `user_contacts`, seguindo a convenção de nomear tabelas filhas com o prefixo da entidade "dona" (`band_bookings`, `band_setlists`, `band_songs` → `user_contacts`).

Não existe hoje nenhum objeto de valor de telefone nem enum de tipo de telefone (celular/fixo) no domínio — telefone é tratado como `string` simples em todo o código, validado por regex na própria DTO. A validação mais recente e mais rigorosa está em `create-band-booking.dto.ts`: `BRAZILIAN_PHONE_REGEX = /^\d{10,11}$/`, aceitando tanto números de 10 dígitos (fixo) quanto 11 dígitos (celular) — não há necessidade de um campo/enum separado indicando o tipo, a própria quantidade de dígitos já diferencia.

Nenhuma entidade do projeto usa relações do TypeORM (`@OneToMany`/`@ManyToOne`); todos os relacionamentos são FKs simples, resolvidas manualmente nos repositórios via `createQueryBuilder`/joins. `Contact` deve seguir a mesma convenção.

## Goals / Non-Goals

**Goals:**
- Criar o recurso `Contact` com `POST /users/contacts`, seguindo a stack vertical completa usada em `band-bookings` (entidade de domínio, repositório, use case, DTO, controller, factory module, migration).
- Vincular automaticamente o contato criado ao usuário autenticado através da coluna `user_id` na tabela `user_contacts` (FK obrigatória, 1:N — um usuário tem vários contatos, cada contato pertence a exatamente um usuário).

**Non-Goals:**
- Não modelar nenhuma relação entre `Contact` e `Band` nesta mudança — nem coluna, nem tabela pivô. Fica inteiramente para uma mudança futura, quando o fluxo de seleção de contato em um booking/evento for definido com mais detalhe.
- Não implementar endpoints de listagem, atualização ou remoção de contatos (`GET`/`PATCH`/`DELETE`) — apenas `POST /users/contacts`, conforme escopo definido na proposta.
- Não criar um objeto de valor `Phone` compartilhado — mantém-se a convenção atual (regex local na DTO), evitando refatorar `create-band-booking.dto.ts`/`create-user.dto.ts` fora do escopo desta mudança.
- Não modelar um enum de "função/cargo" do contato — campo livre em texto, pois não há um conjunto fechado de valores definido pelo usuário.

## Decisions

### 1. Tabela `user_contacts`, com PK surrogate `uuid`
Segue o padrão de `band_bookings`: `id uuid` gerado na camada de aplicação (use case), não `default: uuid_generate...` no banco. Nome da tabela segue a convenção `<entidade dona>_<recurso>` já usada no projeto (`band_bookings`, `band_setlists`).

Colunas: `user_id` (FK obrigatória para `users`); `name`, `phone`, `venue_name`, `address`, `email` e `role` obrigatórios; `alternate_phone` e `notes` opcionais; `created_at`, `updated_at`.

**Alternativa considerada**: manter o nome genérico `contacts` — descartada em favor de `user_contacts`, deixando explícito no próprio nome da tabela que o contato pertence a um usuário (mesma lógica de `band_bookings` pertencer a uma banda).

### 2. Telefones reaproveitam `BRAZILIAN_PHONE_REGEX`
`phone` e `alternate_phone` usam `@Matches(BRAZILIAN_PHONE_REGEX)` (10 ou 11 dígitos, somente números). `alternate_phone` é `@IsOptional()`. Persistidos como `varchar(11)`, mesma convenção de `users`/`band_bookings`.

### 2.1 Validação dos demais campos obrigatórios reaproveita os padrões existentes
`create-band-booking.dto.ts` já modela exatamente o mesmo conceito de "contato de um evento" através dos campos `title` (nome do local/evento) e `focal_point_name` (nome do contato), ambos com `@IsString() @MinLength(1)` — esse é o padrão de validação de nome adotado para `name`, `venue_name` e `role` em `Contact`. `address` reaproveita `@IsString() @MinLength(1)`, idêntico ao campo `address` de `create-band-booking.dto.ts`. `email` reaproveita o padrão de `create-user.dto.ts`: `@IsEmail() @MaxLength(254)`.

### 3. Contato pertence a exatamente um usuário (`user_id` obrigatório)
`user_id` é preenchido a partir do usuário autenticado (token JWT), nunca a partir do corpo da requisição. A criação do contato é um único `INSERT` na tabela `user_contacts`. FK com `onDelete: CASCADE`: se o usuário for removido, seus contatos são removidos junto (mesmo dono).

### 4. Rota `POST /users/contacts`, protegida apenas por `JwtAuthGuard`
Diferente de `band-bookings` (aninhado em `bands/:id/bookings`, com `:id` de banda e `AuthUserIsMemberBandGuard`), `Contact` é aninhado sob `users/contacts` sem parâmetro `:id` na URL — o usuário dono é sempre o autenticado, nunca informado na rota ou no body. Guard: `JwtAuthGuard`. O `user_id` vem exclusivamente do usuário autenticado (token).

### 5. Sem relações TypeORM (`@ManyToOne`)
Mantendo a convenção do restante do código, a FK `user_id` é resolvida com coluna simples e queries manuais no repositório, não com decorators de relação do TypeORM.

## Risks / Trade-offs

- **[Risco]** Exigir `venue_name`, `address`, `email` e `role` como obrigatórios pode impedir o cadastro de contatos avulsos que ainda não têm essas informações completas (ex.: técnico de som sem casa fixa). → **Mitigação**: decisão explícita do usuário; se o uso real mostrar necessidade, os campos podem ser flexibilizados em iteração futura.
- **[Risco]** Como cada contato agora pertence a exatamente um usuário (e não pode ser compartilhado entre vários usuários), dois usuários da mesma banda que queiram guardar o mesmo contato precisarão cadastrá-lo duas vezes, cada um em sua própria lista. → **Mitigação**: aceito como trade-off da modelagem 1:N; pode ser revisitado no futuro se duplicidade de contatos se tornar um problema.
- **[Risco]** Adiar totalmente a modelagem da relação com `Band` pode exigir uma migration adicional no futuro (`ALTER TABLE user_contacts ADD COLUMN band_id`) em vez de já ter a coluna pronta. → **Mitigação**: aceito por decisão explícita do usuário — a relação com banda nem está bem definida ainda para ser modelada agora.
- **[Trade-off]** Não criar um value object `Phone` mantém inconsistência já existente no projeto (regex duplicada entre DTOs). → Aceito para não expandir o escopo desta mudança; oportunidade de refactor futuro pode ser aberta separadamente.

## Migration Plan

1. Migration `create-user-contacts-table` (tabela `user_contacts`, com `user_id` FK `CASCADE` obrigatória).
2. Nenhum dado existente é afetado (tabela nova); sem necessidade de backfill.
3. Rollback: `npm run migration:revert` (drop `user_contacts`).

## Open Questions

- A relação entre `Contact` e `Band` (incluindo se será 1:N ou N:N, e como e quando o vínculo será criado a partir de um booking) será definida em uma mudança OpenSpec futura, quando esse fluxo estiver mais claro.
