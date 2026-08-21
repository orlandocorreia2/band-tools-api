## Context

`band_bookings` hoje duplica `focal_point_name`, `phone` e `address` como colunas próprias, embora a entidade `Contact` (`user_contacts`) já exista e armazene essas mesmas informações vinculadas a um `user_id`. A mudança troca esses três campos por uma referência (`contact_id`) ao contato já cadastrado pelo usuário.

Restrições relevantes do código atual:
- `Contact` pertence a um usuário (`user_id`), não a uma banda; a listagem de contatos já isola por `user_id` (`GET /users/contacts` só retorna contatos do próprio usuário).
- `IContactRepository` hoje só expõe `save` e `findAllByUserId` — não há busca por `id`.
- `CreateBandBookingUseCase` hoje não depende de nada relacionado a contato.
- Não existe endpoint de exclusão de contato ainda, então o comportamento da FK em caso de exclusão é uma decisão prospectiva, não uma necessidade imediata.

## Goals / Non-Goals

**Goals:**
- Substituir os três campos de contato duplicados em `band_bookings` por `contact_id`.
- Garantir que só é possível referenciar em um agendamento um contato que pertence ao usuário autenticado que está criando o agendamento (evitar IDOR: um usuário não pode "adivinhar" o UUID de contato de outro usuário e vinculá-lo a um agendamento de sua banda).
- Manter a resposta do endpoint de criação de agendamento sem corpo (201), como hoje.

**Non-Goals:**
- Não cria endpoint de exclusão de contato nem trata exclusão de contato referenciado (fora de escopo; apenas define o comportamento da FK para não deixar o schema em estado inconsistente no futuro).
- Não migra/preenche `contact_id` a partir de dados legados de `focal_point_name`/`phone`/`address` — este é um ambiente pré-produção, sem necessidade de backfill (ver Migration Plan).
- Não altera a regra de que o contato pertence ao usuário (não à banda); múltiplos membros da banda continuam usando exclusivamente seus próprios contatos ao criar agendamentos.

## Decisions

### 1. `contact_id` obrigatório, sem opção de manter campos livres
Optamos por remover totalmente `focal_point_name`, `phone` e `address` em vez de manter os campos como fallback opcional. Manter os dois formatos aumentaria a complexidade de validação (teria de decidir qual fonte de verdade vale) e perpetuaria a duplicação que motivou a mudança. Como o app ainda está em fase inicial (poucos commits, sem indício de uso em produção), o custo de uma mudança **BREAKING** no contrato é aceitável agora.

### 2. Validação de posse do contato no caso de uso, via novo método de repositório
`IContactRepository` ganha `findByIdAndUserId(id, userId): Promise<Contact | null>` (nome final a ajustar conforme convenção do projeto). `CreateBandBookingUseCase` passa a receber `IContactRepository` como dependência (injeção via `BandBookingFactoryModule`, seguindo o padrão de `useFactory` já usado no projeto) e, antes de persistir o agendamento, chama esse método:
- Se o contato não existir **ou** não pertencer ao usuário autenticado, o caso de uso rejeita a criação.
- **Alternativa descartada**: buscar o contato só por `id` (sem filtrar por `user_id`) e comparar `contact.user_id === authenticatedUserId` no caso de uso. Descartada porque espalha a regra de posse pela camada de aplicação; centralizar o filtro na query do repositório é mais direto e evita vazar dados de outro usuário mesmo transitoriamente em memória.

### 3. Contato inexistente ou de outro usuário retorna 404
Seguindo o padrão já usado nas outras validações do mesmo endpoint (banda inexistente → 404, usuário autenticado inexistente → 404, não-membro → 403), a ausência de posse do contato retorna **404**, não 422 nem 403. Do ponto de vista do usuário autenticado, um contato de outro usuário simplesmente "não existe" — não expomos que o UUID corresponde a um contato de outra pessoa. Isso é consistente com o princípio de não revelar a existência de recursos que o requisitante não pode acessar (evita enumeração/IDOR).
A ordem de validação no caso de uso passa a ser: banda existe → usuário existe → usuário é membro da banda → contato existe e pertence ao usuário autenticado. Essa checagem de posse do contato é a última porque depende das checagens anteriores (usuário autenticado precisa existir para ter contatos).

### 4. FK `contact_id → user_contacts.id` com `ON DELETE RESTRICT`
Como hoje não há exclusão de contato, qualquer comportamento é "seguro" no sentido de nunca ser exercitado — mas escolhemos `RESTRICT` (em vez de `CASCADE` ou `SET NULL`) porque é o comportamento mais seguro por padrão (fail secure): impede que uma futura feature de exclusão de contato apague silenciosamente o histórico de um agendamento ou deixe `contact_id` nulo em um registro que hoje é obrigatório. Se uma feature de exclusão de contato for proposta depois, ela decide explicitamente como tratar contatos referenciados (ex.: bloquear exclusão, ou pedir confirmação).

### 5. Migration única altera a tabela existente (sem coluna nova em paralelo)
Como o projeto está em fase inicial e sem evidência de dados em produção que dependam do formato atual, a migration remove as três colunas antigas e adiciona `contact_id` na mesma migration, em vez de um rollout em duas etapas (adicionar coluna nova, backfill, remover coluna antiga). Ver Migration Plan / Riscos.

## Risks / Trade-offs

- **[Risco] Migration é destrutiva**: qualquer `band_bookings` já cadastrado perde `focal_point_name`, `phone` e `address` sem substituto automático (não há como inferir qual `contact_id` corresponde a um agendamento já existente) → **Mitigação**: confirmar com o time que não há dados de agendamento em produção antes de rodar a migration; se houver, este design precisa ser revisto para um rollout em duas etapas com backfill manual antes do `apply`.
- **[Risco] Mudança de contrato quebra clientes existentes da API** (mobile/web) que hoje enviam `focal_point_name`/`phone`/`address` → **Mitigação**: é uma mudança **BREAKING** assumida deliberadamente (ver Decisão 1); deve ser comunicada e versionada junto com o deploy do app cliente.
- **[Risco] Acoplamento entre capacidades**: `CreateBandBookingUseCase` (capability `band-bookings`) passa a depender de `IContactRepository` (capability `contact-management`) → **Mitigação**: a dependência é só da interface de domínio (`IContactRepository`), não da implementação TypeORM, preservando a Inversão de Dependência já usada no projeto; a injeção é resolvida no `BandBookingFactoryModule`.

## Migration Plan

1. Adicionar `findByIdAndUserId` em `IContactRepository` e implementação em `ContactRepository`.
2. Migration TypeORM: em `band_bookings`, `DROP COLUMN focal_point_name`, `DROP COLUMN phone`, `DROP COLUMN address`; `ADD COLUMN contact_id uuid NOT NULL`; `ADD CONSTRAINT ... FOREIGN KEY (contact_id) REFERENCES user_contacts(id) ON DELETE RESTRICT`; índice em `contact_id`.
3. Atualizar `BandBookingEntity` (domínio) e `BandBookingTypeormEntity` (infraestrutura) para refletir o novo campo.
4. Atualizar `CreateBandBookingDto` (remove os 3 campos, adiciona `contact_id: string` com `@IsUUID()`) e o decorator Swagger correspondente.
5. Atualizar `CreateBandBookingUseCase` para injetar `IContactRepository` e validar posse do contato antes de persistir.
6. Atualizar `BandBookingFactoryModule` para prover `IContactRepository` ao caso de uso de criação de agendamento.
7. Atualizar testes unitários e e2e existentes para o novo contrato.

**Rollback**: revert da migration restaura as três colunas antigas (sem dados, pois não há backfill reverso); revert do código volta ao DTO/entidade anteriores. Como a migration é destrutiva, o rollback não recupera `focal_point_name`/`phone`/`address` de agendamentos criados após o deploy — apenas restaura a estrutura da tabela.

## Open Questions

- Confirmar se já existem agendamentos cadastrados em produção antes de aplicar a migration destrutiva (ver Riscos). Se sim, este design precisa ser revisado para incluir uma etapa de backfill.
