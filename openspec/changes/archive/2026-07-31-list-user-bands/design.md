## Context

`GET /bands` será o primeiro endpoint de leitura/listagem do código. Todos os casos de uso existentes são de escrita (`POST /bands`, `POST /bands/:id/song`) e retornam `Promise<void>`, e não existe nenhum response DTO hoje em `shared/communication/dtos`. O relacionamento de membership já existe: `band_members(band_id, user_id, is_owner, created_at, updated_at)`, com índice em `user_id` (migration `1784651680416-create-band-members-table.ts`). Não existe um campo separado de "criador" em `bands` — o criador de uma banda é simplesmente o registro em `band_members` com `is_owner = true`, criado transacionalmente junto com a banda (`BandRepository.saveWithOwner`). Portanto, "bandas que o usuário pertence ou criou" é uma única query: todas as bandas unidas a `band_members` filtradas por `user_id`, sem necessidade de filtro por `is_owner` (os registros de dono já são um subconjunto dos registros de membership).

## Goals / Non-Goals

**Goals:**
- Adicionar `GET /bands`, protegido pelo `JwtAuthGuard` já existente, retornando todas as bandas vinculadas ao usuário autenticado via `band_members` (dono ou membro comum, indistintamente).
- Estabelecer as primeiras convenções de leitura deste código: um método de consulta em `IBandRepository`, um use case de leitura, e um response DTO — reutilizáveis por futuros endpoints de listagem/detalhe.
- Manter a resposta sem paginação, conforme solicitado explicitamente: um único envelope JSON com todas as bandas correspondentes, dentro da chave `data`.

**Non-Goals:**
- Paginação, ordenação ou filtros por query params (gênero, status, etc.) — não solicitado, fica para uma mudança futura se necessário.
- Expor o papel do usuário (`is_owner`) por banda na resposta — fora de escopo; o requisito é apenas "listar as bandas", não "indicar meu relacionamento com cada uma".
- Alterar como bandas são criadas ou como registros de membership são criados — sem alteração.
- Qualquer mudança de schema em `band_members`/`bands` — a tabela e o índice existentes já suportam essa query.

## Decisions

- **Formato da query**: adicionar `findAllByUserId(userId: string): Promise<BandEntity[]>` em `IBandRepository`, implementado em `BandRepository` como um join entre `bands` e `band_members` filtrado por `band_members.user_id`, ordenado por `bands.created_at DESC` (banda criada mais recentemente primeiro — um padrão razoável já que nenhuma ordenação foi especificada). Alternativa considerada: adicionar um `findBy(filter)` genérico, espelhando `IUserRepository.findBy`, mas um objeto de filtro adiciona indireção para um único padrão de acesso bem definido (buscar por usuário dono/membro), sem outros chamadores hoje; um método nomeado é mais claro e segue a preferência do Object Calisthenics por intenção explícita em vez de parametrização genérica.
- **Use case**: novo `ListBandsByUserUseCase` (`src/application/usecase/band/list-bands-by-user.usecase.ts` + interface), `execute(userId: string): Promise<BandEntity[]>`, delegando diretamente ao repositório — sem regras de negócio além do próprio filtro (diferente do `CreateBandUseCase`, não há checagem de existência necessária: um usuário autenticado sem nenhum vínculo simplesmente recebe um array vazio, o que é um estado válido, não um erro).
- **Response DTO**: introduzir `src/shared/communication/dtos/band/band-response.dto.ts` (ou nome similar), mapeando os campos de `BandEntity` para um formato de resposta plano via um mapper estático (`fromEntity`/`fromEntities`), documentado com `@ApiProperty` para o Swagger. Isso evita vazar a entidade de domínio diretamente pela camada HTTP e estabelece o padrão para futuros endpoints de leitura.
- **Envelope `data`**: a resposta do endpoint segue o formato `{ data: BandResponseDto[] }`, não um array JSON solto na raiz. Introduzir `ListBandsResponseDto` (`src/shared/communication/dtos/band/list-bands-response.dto.ts`) com um único atributo `data: BandResponseDto[]` (`@ApiProperty({ type: [BandResponseDto] })`), construído a partir de `BandResponseDto.fromEntities(bands)`. O controller retorna essa instância diretamente, sem interceptor global de serialização — mantendo o padrão de cada endpoint ser explícito sobre seu próprio formato de resposta, já que hoje não existe nenhum envelope global configurado no bootstrap da aplicação.
- **Controller**: `BandController.list()` trata `@Get()` em `bands`, sob o mesmo `@UseGuards(JwtAuthGuard)`, reaproveitando o tipo local `AuthenticatedRequest` já existente para ler `request.user.id`.
- **Sem paginação**: requisito de produto confirmado explicitamente; o índice em `user_id` de `band_members` mantém essa query barata nas cardinalidades esperadas de bandas por usuário (um usuário pertence a poucas bandas, não a milhares), então paginação não é necessária agora.

## Risks / Trade-offs

- [Conjunto de resultado sem limite caso um usuário pertença a muitas bandas] → Aceitável na escala atual; se isso se tornar um problema, paginação pode ser adicionada depois como um query-param opcional, sem quebrar este contrato.
- [As primeiras convenções do caminho de leitura (formato do response DTO, padrão de mapper) estão sendo decididas de forma ad hoc nesta mudança] → Mitigado mantendo o DTO e o mapper mínimos e consistentes com as convenções de DTO/Swagger já existentes em `create-band.dto.ts`, para que futuros endpoints de leitura possam copiar o padrão.
- [Corretude da query de join — não deve retornar bandas duplicadas caso um usuário pudesse ter múltiplos registros em `band_members` para a mesma banda] → Não é possível dada a chave primária composta `(band_id, user_id)` em `band_members`; cada par é único por construção.

## Open Questions

Nenhuma — escopo, ordenação e formato de resposta estão definidos acima; podem ser revisitados se houver feedback de produto que exija filtros/paginação futuramente.
