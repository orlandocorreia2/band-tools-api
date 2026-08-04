## ADDED Requirements

### Requirement: Cadastro de música em um setlist da banda
O sistema DEVE (SHALL) permitir associar uma música do repertório da banda a um setlist através de `POST /bands/:id/setlists/:setlistId/songs`, com os seguintes campos obrigatórios no corpo da requisição:

- `bandSongId`: string, UUID v7 (identificador da música em `band_songs`)
- `position`: número inteiro positivo (posição da música no setlist)

Todas as validações DEVEM ser aplicadas via decorators do `class-validator` no DTO e documentadas via Swagger (`@ApiProperty`).

O vínculo cadastrado DEVE ser persistido referenciando o `setlistId` informado na rota e o `bandSongId` informado no corpo, com um `id` gerado (UUIDv7), `created_at` e `updated_at` preenchidos automaticamente.

#### Scenario: Cadastro com os campos obrigatórios preenchidos
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada contendo `bandSongId` e `position` válidos, referentes a um setlist e uma música existentes e pertencentes à banda `:id`
- **THEN** o sistema DEVE persistir o vínculo entre a música e o setlist com a `position` informada e retornar HTTP 201 sem corpo

#### Scenario: Cadastro com corpo malformado
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um corpo não interpretável (ex.: JSON inválido)
- **THEN** o sistema DEVE retornar HTTP 400

#### Scenario: Cadastro sem o campo bandSongId
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada sem o campo `bandSongId` ou com um valor que não seja um UUID válido
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `bandSongId`

#### Scenario: Cadastro sem o campo position
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada sem o campo `position` ou com um valor que não seja um número inteiro positivo
- **THEN** o sistema DEVE retornar HTTP 422 com uma mensagem de erro identificando o campo `position`

### Requirement: Autenticação e vínculo do usuário com a banda no cadastro de música no setlist
O sistema DEVE (SHALL) identificar o usuário autenticado a partir do JWT (via `JwtAuthGuard`) e realizar as seguintes verificações, nesta ordem, antes de persistir o vínculo:

1. A banda referenciada pelo parâmetro `:id` DEVE existir na tabela `bands`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo.
2. O usuário autenticado DEVE existir na tabela `users`; caso não exista, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo.
3. O usuário autenticado DEVE ser membro da banda (DEVE existir um registro correspondente em `band_members` para o par banda/usuário); caso não seja, o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir o vínculo.

#### Scenario: Banda informada não existe
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um `:id` que não corresponde a nenhuma banda cadastrada
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo

#### Scenario: Usuário autenticado não existe mais na base
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um JWT estruturalmente válido (assinatura correta, não expirado) cujo `sub` não corresponde a nenhum registro em `users`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo

#### Scenario: Usuário autenticado não é membro da banda
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada por um usuário autenticado e existente, mas que não possui vínculo em `band_members` com a banda informada em `:id`
- **THEN** o sistema DEVE retornar HTTP 403 e NÃO DEVE persistir o vínculo

#### Scenario: Requisição sem autenticação
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada sem um JWT válido
- **THEN** o sistema DEVE retornar HTTP 401

### Requirement: Validação de posse do setlist e da música pela banda
O sistema DEVE (SHALL), após as verificações de autenticação e associação à banda, validar que tanto o setlist quanto a música informados pertencem à banda `:id` antes de persistir o vínculo:

1. O setlist referenciado por `:setlistId` DEVE existir na tabela `band_setlists` e pertencer à banda `:id`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo.
2. A música referenciada por `bandSongId` DEVE existir na tabela `band_songs` e pertencer à banda `:id`; caso contrário, o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo.

#### Scenario: Setlist informado não existe
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um `:setlistId` que não corresponde a nenhum setlist cadastrado
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo

#### Scenario: Setlist informado pertence a outra banda
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um `:setlistId` que existe, mas está vinculado a uma banda diferente de `:id`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo

#### Scenario: Música informada não existe
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um `bandSongId` que não corresponde a nenhuma música cadastrada
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo

#### Scenario: Música informada pertence a outra banda
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um `bandSongId` que existe, mas está vinculado a uma banda diferente de `:id`
- **THEN** o sistema DEVE retornar HTTP 404 e NÃO DEVE persistir o vínculo

### Requirement: Duplicidade de música permitida no setlist
O sistema NÃO DEVE (SHALL NOT) validar unicidade de `bandSongId` dentro de um mesmo setlist. A mesma música PODE ser associada mais de uma vez ao setlist (ex.: bis).

#### Scenario: Mesma música adicionada duas vezes ao setlist
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com um `bandSongId` que já está associado ao mesmo `:setlistId` por um vínculo anterior
- **THEN** o sistema DEVE persistir o novo vínculo normalmente e retornar HTTP 201 sem corpo

### Requirement: Reposicionamento automático em caso de colisão de position
Quando a `position` informada no corpo da requisição já está em uso por outro vínculo do mesmo `:setlistId`, o sistema DEVE (SHALL) ignorar o valor informado e persistir o novo vínculo na última posição do setlist, calculada como o maior valor de `position` entre os vínculos existentes desse `:setlistId` mais 1.

Se o setlist ainda não possui nenhum vínculo cadastrado, não há colisão possível e o sistema DEVE persistir o vínculo com a `position` exatamente como informada.

#### Scenario: Position já ocupada por outra música no mesmo setlist
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com uma `position` já utilizada por outro vínculo existente no mesmo `:setlistId`, cujo maior valor de `position` cadastrado é `N`
- **THEN** o sistema DEVE persistir o novo vínculo com `position` igual a `N + 1` (ignorando o valor informado no corpo) e retornar HTTP 201 sem corpo

#### Scenario: Position informada não colide com nenhum vínculo existente
- **WHEN** uma requisição `POST /bands/:id/setlists/:setlistId/songs` é enviada com uma `position` que ainda não é usada por nenhum vínculo do mesmo `:setlistId` (incluindo o caso de o setlist não ter nenhuma música cadastrada)
- **THEN** o sistema DEVE persistir o novo vínculo com a `position` exatamente como informada e retornar HTTP 201 sem corpo
