## Context

`ListSetlistSongsUseCase` já retorna pares `{ bandSetlistSong, bandSong }`, em que `bandSong` é a `BandSongEntity` completa buscada em lote via `IBandSongRepository.findAllByIds`. A entidade já tem `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes`. Hoje o corte acontece só em `SetlistSongResponseDto`, que copia apenas `title` da música.

As colunas correspondentes em `band_songs` são `nullable`. O TypeORM devolve `null` para valores ausentes, mas `BandSongEntity` tipa esses campos como opcionais (`?: T`, ou seja, `undefined`). Na serialização JSON, `undefined` omite a chave e `null` a mantém.

Motivação: ver proposal.md, seção Why. Requisitos: ver `specs/band-setlist-songs/spec.md`.

## Goals / Non-Goals

**Goals:**
- Expor os seis campos da música na listagem mexendo apenas na camada de DTO.
- Garantir que as seis chaves estejam sempre presentes, com `null` quando não houver valor, qualquer que seja a origem do dado (TypeORM ou objetos montados em teste).
- Manter 100% de cobertura unitária.

**Non-Goals:**
- Alterar use case, repositórios, entidades de domínio ou schema.
- Expor `band_id`, `created_at` ou `updated_at` da música.
- Paginação, projeção de campos por query string (ex.: `?fields=`) ou omissão de `lyrics`.
- Tratar o caso de vínculo órfão (`bandSong` não encontrado para um `band_song_id`). O comportamento atual não muda e fica para uma proposta futura, se surgir remoção de músicas do repertório.

## Decisions

### Mudança isolada em `SetlistSongResponseDto`
O use case já entrega a `BandSongEntity` completa, então basta mapear mais campos no construtor privado do DTO. `ListSetlistSongsResponseDto`, o controller, o decorator Swagger (que referencia o tipo do DTO) e o `BandFactoryModule` continuam iguais.
**Alternativa considerada:** criar um DTO novo ou versionar o endpoint. Rejeitada porque a mudança é aditiva e não quebra clientes existentes.

### Projeção plana, sem aninhar `band_song`
Os seis campos entram no mesmo nível de `title`, mantendo o formato já adotado no item.
**Alternativa considerada:** aninhar `band_song: BandSongResponseDto`, reaproveitando o DTO de música. Rejeitada porque mudaria o formato do item (`title` ficaria duplicado ou teria que migrar, o que quebraria clientes) e traria de volta `band_id`/`created_at`/`updated_at` da música, que se confundem com os do vínculo.

### Normalizar ausência para `null` no DTO (`?? null`)
Cada campo novo é atribuído como `bandSong.<campo> ?? null` e tipado como `T | null`, documentado com `@ApiPropertyOptional({ example, nullable: true })`. Assim a chave está sempre no JSON, e o cliente Flutter/web recebe um contrato estável, sem precisar distinguir "chave ausente" de "valor nulo".
**Alternativa considerada:** copiar o valor direto (como `BandSongResponseDto` faz hoje). Rejeitada porque, se o valor vier `undefined`, a chave some do JSON e a spec deixa de ser atendida. O `?? null` custa pouco e deixa o contrato explícito.
**Observação de cobertura:** cada `??` gera dois branches. Os testes unitários do DTO precisam cobrir uma música com todos os campos preenchidos e outra só com `title`.

## Risks / Trade-offs

- [Payload maior, principalmente por `lyrics` (`text`, sem limite), em um endpoint não paginado] → Aceito: setlists têm dezenas de músicas, e o cliente pediu os dados justamente para usar offline durante o show. Se virar problema, uma proposta futura pode adicionar `?fields=` ou um endpoint de detalhe.
- [Superfície de exposição de dados] → Sem mudança de AuthZ: a rota continua protegida por `JwtAuthGuard` + `AuthUserIsMemberBandGuard` e pela validação de posse do setlist, e os campos já são visíveis ao mesmo público via `GET /bands/{id}/songs`. `notes` e `lyrics` são texto livre, então a resposta não deve ser logada em nenhum interceptor.
- [Divergência entre `SetlistSongResponseDto` e `BandSongResponseDto` se um novo campo for adicionado à música no futuro] → Aceito. O spec do DTO de setlist documenta explicitamente os campos esperados, e uma nova coluna exige uma nova proposta de qualquer forma.

## Migration Plan

Nenhuma migration de banco. Deploy comum. Rollback é reverter o commit, e clientes que já consomem os novos campos precisam tratá-los como opcionais.
