## Context

Uma banda já cadastra músicas no seu repertório (`band_songs`, capability `band-repertoire`). O objetivo final é permitir organizar um subconjunto dessas músicas, em uma ordem específica, como um setlist para um show. Este primeiro momento cobre apenas o cadastro do setlist em si — nome vinculado a uma banda —, sem a associação de músicas. A associação de músicas ao setlist (tabela de junção, ordenação, validação de pertencimento ao repertório) fica para uma proposta futura.

O padrão de autenticação/autorização já existe e é reutilizável: `JwtAuthGuard` (valida o JWT) + `AuthUserIsMemberBandGuard` (garante banda existente, usuário existente e usuário membro da banda), usados hoje em `POST /bands/:id/songs`.

## Goals / Non-Goals

**Goals:**
- Persistir um setlist (`band_setlists`) vinculado a uma banda, com apenas um `name`

**Non-Goals:**
- Associação de músicas do repertório ao setlist (`band_setlist_songs`, ordenação/`position`) — proposta futura
- Endpoint de listagem de setlists (`GET /bands/:id/setlists`) — fica para uma mudança futura
- Edição ou remoção de setlists
- Qualquer implementação de frontend (menu, página, botão de cadastro) — este repositório é apenas o backend

## Decisions

### Nomenclatura da tabela
`band_setlists` segue o padrão de prefixo `band_` já usado em `band_songs` e `band_members` para recursos pertencentes a uma banda.

### Estrutura da tabela

`band_setlists`:
| Coluna | Tipo | Observação |
|---|---|---|
| `id` | uuid | PK, UUIDv7 (gerado na aplicação, mesmo padrão de `BaseEntity`) |
| `band_id` | uuid | FK → `bands.id`, `ON DELETE CASCADE`, indexado |
| `name` | varchar | obrigatório |
| `created_at` | timestamptz | default `CURRENT_TIMESTAMP` |
| `updated_at` | timestamptz | default `CURRENT_TIMESTAMP` |

Estrutura idêntica ao padrão já usado em `band_songs` (mesmas colunas de auditoria, mesmo tipo de FK e cascade).

### Payload do endpoint

`POST /bands/:id/setlists`, protegido por `JwtAuthGuard` + `AuthUserIsMemberBandGuard` (idêntico a `POST /bands/:id/songs`):

```json
{
  "name": "Show de Sábado"
}
```

- `name`: string, obrigatório, mínimo 1 caractere (mesmo padrão de `title` em `CreateBandSongDto`)

### Persistência simples
Como não há tabela relacionada nesta primeira etapa, a persistência é um único `save` (sem necessidade de transação), seguindo o mesmo padrão de `BandSongRepository.save`.

## Risks / Trade-offs

- [Setlist cadastrado sem nenhuma música associada ainda] → Esperado nesta primeira etapa; a associação de músicas será adicionada em proposta futura sem exigir alteração na tabela `band_setlists`.

## Open Questions

Nenhuma no momento — a modelagem de músicas do setlist (tabela de junção, `position`, validação de pertencimento ao repertório) será decidida na proposta futura correspondente.
