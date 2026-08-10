## Context

Uma banda já pode cadastrar setlists (`band_setlists`, capability `band-setlists`) e músicas de repertório (`band-repertoire`), mas não há como registrar os compromissos de agenda (shows e eventos) em si — data, horário, local e contato responsável pela negociação. Este primeiro momento cobre apenas o cadastro (`POST`) de um agendamento vinculado a uma banda.

O padrão de autenticação/autorização já existe e é reutilizável: `JwtAuthGuard` (valida o JWT) + `AuthUserIsMemberBandGuard` (garante banda existente, usuário existente e usuário membro da banda), usados hoje em `POST /bands/:id/setlists` e `POST /bands/:id/songs`.

## Goals / Non-Goals

**Goals:**
- Persistir um agendamento (`band_bookings`) vinculado a uma banda, com os dados de título, ponto focal, telefone, data, horário de início, duração, endereço, cachê, status e, opcionalmente, consumação, link (Instagram, site ou página do evento/casa de show) e observação
- Validar telefone no formato brasileiro, sem máscara (somente dígitos, fixo ou celular)
- Representar o cachê (`fee`) como valor monetário em reais (BRL), aceitando `0` para shows gratuitos
- Registrar a situação do agendamento (`status`) sempre como `Pending` na criação, sem depender de input do cliente
- Garantir que a combinação `date` + `start_time` seja futura em relação ao momento do cadastro, rejeitando agendamentos em data/hora já passada

**Non-Goals:**
- Endpoint de listagem, edição ou remoção de agendamentos (`GET`/`PATCH`/`DELETE /bands/:id/bookings`) — fica para mudança futura
- Notificações/lembretes sobre o agendamento
- Associação do agendamento com um setlist específico
- Qualquer implementação de frontend — este repositório é apenas o backend

## Decisions

### Nomenclatura do recurso e da tabela
Recurso `booking` (rota `POST /bands/:id/bookings`), tabela `band_bookings`, seguindo o padrão de prefixo `band_` já usado em `band_songs`, `band_members` e `band_setlists`.

### Estrutura da tabela

`band_bookings`:
| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK, UUIDv7 (gerado na aplicação, mesmo padrão de `BaseEntity`) |
| `band_id` | uuid | FK → `bands.id`, `ON DELETE CASCADE`, indexado |
| `title` | varchar | obrigatório |
| `focal_point_name` | varchar | obrigatório — nome do responsável pelo contato do show/evento |
| `phone` | varchar(11) | obrigatório — telefone (fixo ou celular) do ponto focal, sem máscara (somente dígitos) |
| `date` | date | obrigatório |
| `start_time` | varchar(5) | obrigatório — formato `HH:mm` |
| `duration` | varchar | obrigatório — texto livre com a duração do show (ex.: "1 hora", "40 minutos") |
| `address` | varchar | obrigatório |
| `fee` | numeric(10,2) | obrigatório — cachê em reais (BRL); aceita `0`, não aceita negativo nem valor acima de `99999999.99` (capacidade máxima da coluna) |
| `status` | varchar | obrigatório — `Pending` \| `Confirmed` \| `Cancelled`, sempre `Pending` na criação (não recebido do cliente); coluna `varchar` simples, sem `type: 'enum'` do TypeORM/PostgreSQL |
| `consumption` | varchar | opcional — texto livre descrevendo a consumação do local, quando houver |
| `link` | varchar | opcional — URL do evento/casa de show (Instagram, site ou outra página) |
| `note` | varchar | opcional |
| `created_at` | timestamptz | default `CURRENT_TIMESTAMP` |
| `updated_at` | timestamptz | default `CURRENT_TIMESTAMP` |

Estrutura segue o padrão já usado em `band_setlists` (mesmas colunas de auditoria, mesmo tipo de FK e cascade).

`start_time` é armazenado como `varchar(5)` (`HH:mm`), já que não existe hoje nenhum value object ou tipo de hora no domínio; o mesmo padrão simples usado para `phone` (string validada apenas via DTO) é seguido aqui.

### Payload do endpoint

`POST /bands/:id/bookings`, protegido por `JwtAuthGuard` + `AuthUserIsMemberBandGuard` (idêntico a `POST /bands/:id/setlists`):

```json
{
  "title": "Show Bar do Zé",
  "focal_point_name": "Maria Souza",
  "phone": "11987654321",
  "date": "2026-09-12",
  "start_time": "22:00",
  "duration": "1 hora",
  "address": "Rua das Flores, 123 - São Paulo/SP",
  "fee": 800.00,
  "consumption": "Consumação mínima de R$ 50,00 por pessoa",
  "link": "https://instagram.com/bardoze",
  "note": "Levar equipamento de som próprio"
}
```

- `title`: string, obrigatório, mínimo 1 caractere
- `focal_point_name`: string, obrigatório, mínimo 1 caractere
- `phone`: string, obrigatório, somente dígitos, sem máscara — 10 caracteres (DDD + fixo de 8 dígitos) ou 11 caracteres (DDD + celular de 9 dígitos com o 9 na frente); formatos como `(11) 98765-4321` são rejeitados
- `date`: string ISO 8601 (`YYYY-MM-DD`), obrigatório, convertido para `Date` via `class-transformer`
- `start_time`: string no formato `HH:mm`, obrigatório
- `duration`: string, obrigatório, mínimo 1 caractere (texto livre com a duração do show, ex.: "1 hora", "40 minutos")
- `address`: string, obrigatório, mínimo 1 caractere
- `fee`: number, obrigatório, `@Min(0)` + `@Max(99999999.99)` (cachê em reais; `0` representa show gratuito; o teto casa com a capacidade da coluna `numeric(10,2)`)
- `consumption`: string, opcional (texto livre da consumação)
- `link`: string, opcional, deve ser uma URL válida quando informado (link do evento/casa de show — Instagram, site ou outra página)
- `note`: string, opcional
- `status` **não** faz parte do payload de entrada — o `ValidationPipe` (`whitelist: true`) descarta silenciosamente qualquer `status` enviado pelo cliente, e a aplicação sempre cria o agendamento com `status` igual a `Pending`

A resposta do `POST` segue o mesmo padrão de `POST /bands/:id/setlists`: `201 Created` sem corpo.

### Representação monetária do cachê
`fee` é armazenado como `numeric(10,2)` no PostgreSQL (evita erro de arredondamento de ponto flutuante em valor monetário). Como colunas `decimal`/`numeric` do TypeORM retornam `string` por padrão, a coluna usa um `transformer` (`to`/`from`) para converter para `number` na entidade de domínio, mantendo `fee` como `number` em toda a camada de aplicação — sem necessidade de um value object de dinheiro nesta primeira etapa, seguindo o mesmo nível de simplicidade adotado para `phone` e `start_time`. Não há campo de moeda: a aplicação assume reais (BRL) implicitamente, já que é o único mercado atendido hoje.

`numeric(10,2)` comporta no máximo 10 dígitos no total (8 inteiros + 2 decimais), ou seja, até `99999999.99`. Um valor acima disso (ex.: `10000000000`) causa `numeric field overflow` no PostgreSQL — sem um teto correspondente no DTO, esse erro de banco vazava como HTTP 500 genérico em vez de um 422 de validação. Por isso o DTO usa `@Max(99999999.99)` além de `@Min(0)`, espelhando exatamente a capacidade da coluna. Pelo mesmo motivo, `@IsNumber({ maxDecimalPlaces: 2 })` rejeita valores com mais de 2 casas decimais (ex.: `800.999`), que de outra forma seriam aceitos e arredondados silenciosamente pelo PostgreSQL (para `801.00`) sem qualquer erro — uma perda de precisão silenciosa inaceitável para um campo monetário.

### Persistência da data sem depender do fuso do processo
Assim como a validação de data/hora futura, a persistência de `date` tem uma armadilha de fuso horário — só que na direção oposta e num nível mais baixo (dentro do próprio TypeORM). Por padrão, colunas `type: 'date'` do TypeORM serializam o valor com `date.getFullYear()/getMonth()/getDate()` (getters **locais**) ao gravar. Como `date` chega ao domínio como meia-noite UTC (o `class-transformer` interpreta `"YYYY-MM-DD"` dessa forma), rodar a aplicação em qualquer fuso horário atrasado em relação a UTC (e.g. `America/Los_Angeles`, `America/Sao_Paulo`) faz o TypeORM ler a data local de "ontem" e persistir o dia errado — silenciosamente, sem erro. Isso não se manifestava em desenvolvimento porque o container Docker roda em UTC por padrão, mas era uma dependência implícita e frágil, sujeita a quebrar caso a `TZ` do processo mude no futuro (algo natural de se configurar numa aplicação que já assume Brasília como fuso de negócio).

A correção usa um `transformer` explícito na coluna `date` (`dateColumnTransformer`, no mesmo arquivo do `feeColumnTransformer`):
- `to()`: serializa o `Date` (sempre meia-noite UTC) para a string `"YYYY-MM-DD"` usando getters UTC, produzindo o texto correto independentemente do fuso do processo.
- `from()`: o driver Postgres do TypeORM sempre normaliza o valor bruto para uma string `"YYYY-MM-DD"` **antes** de invocar o transformer (`PostgresDriver.prepareHydratedValue`), mesmo quando existe um transformer customizado — por isso `from()` recebe uma string (não um `Date`) e a reconstrói como meia-noite UTC via `new Date(`${value}T00:00:00.000Z`)`.

Verificado manualmente sob `TZ=UTC`, `TZ=America/Los_Angeles` e `TZ=Asia/Tokyo`: sem o transformer, `America/Los_Angeles` persistia a data um dia antes da enviada pelo cliente; com o transformer, os três fusos persistem e recuperam a mesma data em todos os casos.

### Validação de data/hora futura
A combinação `date` + `start_time` precisa representar um instante futuro em relação ao momento do cadastro — não basta a data ser hoje ou futura isoladamente: se `date` for a data atual, `start_time` precisa ser um horário ainda não alcançado no dia. Como essa é uma checagem entre dois campos (não validável com um decorator simples do `class-validator` isoladamente) e depende do relógio no momento da execução (não é uma regra estática do formato do dado), a validação é feita no use case (`CreateBandBookingUseCase`).

A montagem do instante é feita inteiramente em UTC, sem depender do fuso horário do processo Node (`new Date()` "local"): os componentes de ano/mês/dia são extraídos de `date` via `getUTCFullYear`/`getUTCMonth`/`getUTCDate` (o `class-transformer` interpreta a string `YYYY-MM-DD` como meia-noite UTC) e combinados com as horas/minutos de `start_time` (`HH:mm`) através de `Date.UTC(ano, mês, dia, hora + 3, minuto)` — o `+3` é uma constante `BRAZIL_UTC_OFFSET_HOURS` que representa o offset fixo de Brasília (UTC-3, sem horário de verão desde 2019), convertendo o horário de parede informado pelo cliente (sempre interpretado como horário de Brasília) para o instante UTC absoluto correspondente. Esse instante é comparado com `new Date()` (que sempre retorna um instante absoluto, independente de fuso) no momento da execução, lançando `ApplicationUnprocessableEntityException` (422) quando não for estritamente posterior a agora.

Uma primeira versão desta lógica usava o construtor `new Date(ano, mês, dia, hora, minuto)` (que interpreta os componentes no fuso horário *local do processo*) em vez de `Date.UTC` com offset explícito. Isso funcionava nos testes e no ambiente de desenvolvimento local (cujo shell roda em GMT-03:00, coincidindo com o horário de Brasília), mas falhava em produção: o container Docker roda em UTC (`TZ` não definida), então "21:00" acabava sendo interpretado como 21:00 UTC (18:00 em Brasília) em vez de 00:00 UTC do dia seguinte (21:00 em Brasília) — rejeitando incorretamente agendamentos válidos como passados. Usar `Date.UTC` com o offset fixo elimina essa dependência do fuso do processo por completo.

### Status do agendamento
`status` é um novo enum `BandBookingStatusEnum` (`src/shared/commons/enums/band-booking.enum.ts`), com valores `Pending`, `Confirmed` e `Cancelled`, seguindo o mesmo padrão de nomenclatura em inglês já usado em `BandStatusEnum` (`Active`/`Inactive`). O enum existe apenas na camada de aplicação, para tipar e validar o valor antes de persistir — não é um `type: 'enum'` do TypeORM/PostgreSQL; a coluna no banco é um `varchar` simples, seguindo o mesmo padrão já usado em `bands.status` (também `varchar`, sem enum nativo do banco).

`status` não é um campo do payload de criação: a `BandBookingEntity` sempre define `status = BandBookingStatusEnum.Pending` na construção. Esta primeira etapa não expõe nenhuma transição de status (sem endpoint de edição) — o campo existe desde já para evitar uma migration futura só para adicioná-lo quando a listagem/edição de agendamentos for implementada.

### Persistência simples
Sem tabela relacionada nesta primeira etapa, a persistência é um único `save` (sem necessidade de transação), seguindo o mesmo padrão de `BandSetlistRepository.save`.

## Risks / Trade-offs

- [`phone` armazenado como string livre, sem value object] → Aceitável nesta primeira etapa, mesmo padrão já usado em `UserEntity.phone`; validação de formato fica centralizada na regex do DTO.
- [`start_time` como string em vez de tipo de hora dedicado] → Aceitável nesta primeira etapa por não existir ainda um value object de hora no domínio; caso surjam mais casos de uso com horário, extrair um value object comum fica para mudança futura.
- [`fee` sem campo de moeda explícito] → Aceitável nesta primeira etapa por a aplicação atender apenas o mercado brasileiro (BRL); se houver necessidade futura de múltiplas moedas, adicionar coluna `currency` é uma migration aditiva simples.
- [`duration` como texto livre em vez de valor numérico em minutos] → Segue o pedido explícito de campo de texto; impede ordenação/soma programática por duração, mas evita impor um formato rígido a algo que hoje é combinado informalmente (ex.: "1h e meia", "até umas 23h").
- [Offset de Brasília (UTC-3) hardcoded como constante, em vez de usar um banco de dados de fusos horários (ex.: `Intl`/`date-fns-tz`)] → Aceitável nesta primeira etapa por a aplicação atender apenas o mercado brasileiro e o Brasil não observar mais horário de verão desde 2019 (offset fixo, sem transições sazonais); se a aplicação passar a atender outros fusos, substituir a constante por uma biblioteca de fuso horário passa a ser necessário.

## Open Questions

Nenhuma no momento.
