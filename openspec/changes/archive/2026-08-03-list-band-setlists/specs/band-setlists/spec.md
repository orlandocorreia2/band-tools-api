## ADDED Requirements

### Requirement: Listagem de setlists da banda

O sistema DEVE (SHALL) permitir que um usuário autenticado liste todos os setlists de uma banda através de `GET /bands/{bandId}/setlists`, protegido por `JwtAuthGuard`.

O sistema DEVE (SHALL) reutilizar as mesmas verificações já aplicadas ao cadastro de setlist, nesta ordem, antes de retornar a listagem:

1. A banda referenciada por `{bandId}` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404.
2. O usuário autenticado DEVE existir na tabela `users`; caso não exista, o sistema DEVE retornar HTTP 404.
3. O usuário autenticado DEVE ser membro da banda (registro correspondente em `band_members`); caso não seja, o sistema DEVE retornar HTTP 403.

A resposta NÃO DEVE (SHALL NOT) ser paginada: o sistema DEVE (SHALL) retornar o conjunto completo de setlists da banda em uma única resposta. O corpo da resposta DEVE (SHALL) seguir o formato de envelope `{ "data": [...] }`: o array de setlists DEVE (SHALL) estar contido na chave `data`, com as informações de cada setlist (`id`, `band_id`, `name`, `created_at`, `updated_at`), e não retornado como um array solto na raiz do corpo.

#### Scenario: Banda com múltiplos setlists

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada por um usuário autenticado e membro da banda, e a banda possui três setlists cadastrados
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [...] }` cuja chave `data` contém um array com os três setlists e suas informações

#### Scenario: Banda sem nenhum setlist

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada por um usuário autenticado e membro da banda que não possui nenhum setlist cadastrado
- **THEN** o sistema DEVE retornar HTTP status 200 com um corpo `{ "data": [] }`, ou seja, a chave `data` contendo um array vazio

#### Scenario: Resultado exclui setlists de outras bandas

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada por um usuário autenticado e membro da banda, e existem setlists no sistema pertencentes apenas a outras bandas
- **THEN** o sistema NÃO DEVE incluir esses setlists no array contido na chave `data` da resposta

#### Scenario: Banda informada não existe

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada com um `{bandId}` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP status 404

#### Scenario: Usuário autenticado não existe mais na base

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP status 404

#### Scenario: Usuário autenticado não é membro da banda

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `{bandId}`
- **THEN** o sistema DEVE retornar HTTP status 403

#### Scenario: Requisição sem autenticação

- **WHEN** uma requisição `GET /bands/{bandId}/setlists` é enviada sem um JWT válido (ausente, malformado ou expirado)
- **THEN** o sistema DEVE retornar HTTP status 401 e NÃO DEVE retornar nenhum setlist
