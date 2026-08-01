## ADDED Requirements

### Requirement: Listar bandas do usuário autenticado

O sistema DEVE (SHALL) permitir que um usuário autenticado liste todas as bandas às quais pertence via `GET /bands`, protegido pelo `JwtAuthGuard`.

O sistema DEVE (SHALL) identificar o usuário autenticado a partir do payload do JWT anexado pelo `JwtAuthGuard` e DEVE (SHALL) filtrar as bandas pelo `id` desse usuário, usando o relacionamento já existente em `band_members` (coluna `user_id`). Uma banda DEVE (SHALL) ser incluída no resultado sempre que um registro em `band_members` vincular essa banda ao usuário autenticado, independentemente de esse registro ter `is_owner = true` (criador) ou `is_owner = false` (membro comum) — ambos os casos representam bandas às quais o usuário "pertence".

A resposta NÃO DEVE (SHALL NOT) ser paginada: o sistema DEVE (SHALL) retornar o conjunto completo de bandas correspondentes em uma única resposta. O corpo da resposta DEVE (SHALL) seguir o formato de envelope `{ "data": [...] }`: o array de bandas DEVE (SHALL) estar contido na chave `data`, e não retornado como um array solto na raiz do corpo.

#### Scenario: Usuário com múltiplas bandas (próprias e das quais participa)

- **WHEN** uma requisição `GET /bands` é enviada por um usuário autenticado que possui registros em `band_members` para três bandas, sendo um com `is_owner = true` e dois com `is_owner = false`
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [...] }` cuja chave `data` contém um array com as três bandas

#### Scenario: Usuário sem nenhuma banda

- **WHEN** uma requisição `GET /bands` é enviada por um usuário autenticado que não possui nenhum registro em `band_members` para nenhuma banda
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [] }`, ou seja, a chave `data` contendo um array vazio

#### Scenario: Requisição sem autenticação

- **WHEN** uma requisição `GET /bands` é enviada sem um JWT válido (ausente, malformado ou expirado)
- **THEN** o sistema DEVE retornar HTTP status 401 e NÃO DEVE retornar nenhum dado de banda

#### Scenario: Resultado exclui bandas de outros usuários

- **WHEN** uma requisição `GET /bands` é enviada por um usuário autenticado, e existem bandas no sistema que pertencem apenas a outros usuários (sem registro em `band_members` para o usuário solicitante)
- **THEN** o sistema NÃO DEVE incluir essas bandas no array contido na chave `data` da resposta
