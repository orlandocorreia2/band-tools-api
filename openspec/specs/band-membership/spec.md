# band-membership Specification

## Purpose
TBD - created by archiving change band-member-ownership. Update Purpose after archive.
## Requirements
### Requirement: Vínculo entre usuário e banda
O sistema DEVE (SHALL) persistir o relacionamento N:N entre `users` e `bands` através da tabela `band_members`, identificada pela chave primária composta (`band_id`, `user_id`).

A tabela DEVE conter:
- `band_id`: uuid, chave estrangeira para `bands.id`
- `user_id`: uuid, chave estrangeira para `users.id`
- `is_owner`: boolean, `default false`, indicando se o vínculo representa o dono/criador da banda
- `created_at`, `updated_at`: timestamps de auditoria

A tabela DEVE possuir, além do índice da chave primária composta, um índice dedicado na coluna `user_id` para otimizar buscas por "bandas de um usuário".

As chaves estrangeiras `band_id` e `user_id` DEVEM ser criadas com `ON DELETE CASCADE`: a exclusão do registro referenciado em `bands` ou em `users` DEVE remover automaticamente os vínculos correspondentes em `band_members`.

#### Scenario: Estrutura da tabela band_members após a migration
- **WHEN** a migration de criação da tabela `band_members` é executada
- **THEN** a tabela DEVE existir com chave primária composta (`band_id`, `user_id`), colunas `is_owner`, `created_at`, `updated_at`, chaves estrangeiras para `bands.id` e `users.id` com `ON DELETE CASCADE`, e um índice adicional na coluna `user_id`

#### Scenario: Exclusão de uma banda remove seus vínculos de membro
- **WHEN** um registro em `bands` referenciado por um ou mais registros em `band_members` é excluído do banco de dados
- **THEN** todos os registros em `band_members` que referenciam aquele `band_id` DEVEM ser removidos automaticamente pelo banco de dados

#### Scenario: Exclusão de um usuário remove seus vínculos de membro
- **WHEN** um registro em `users` referenciado por um ou mais registros em `band_members` é excluído do banco de dados
- **THEN** todos os registros em `band_members` que referenciam aquele `user_id` DEVEM ser removidos automaticamente pelo banco de dados

### Requirement: Unicidade do vínculo usuário-banda
O sistema DEVE (SHALL) impedir que um mesmo usuário seja vinculado mais de uma vez à mesma banda.

#### Scenario: Tentativa de vínculo duplicado
- **WHEN** já existe um registro em `band_members` para um determinado par (`band_id`, `user_id`) e uma nova inserção é tentada com o mesmo par
- **THEN** o banco de dados DEVE rejeitar a inserção duplicada, por violação da chave primária composta
