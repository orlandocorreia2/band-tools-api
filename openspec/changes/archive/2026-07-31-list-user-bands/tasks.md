## 1. Domínio

- [x] 1.1 Escrever teste unitário cobrindo o uso do contrato `IBandRepository.findAllByUserId` (via fake/mock no spec do use case — ver seção 2)
- [x] 1.2 Adicionar `findAllByUserId(userId: string): Promise<BandEntity[]>` em `IBandRepository` (`src/domain/repositories/band/band.repository.interface.ts`)

## 2. Aplicação (use case)

- [x] 2.1 Escrever teste unitário para `ListBandsByUserUseCase` (`test/unit/application/usecase/band/list-bands-by-user.usecase.spec.ts`): retorna as bandas do repositório para o `userId` informado, retorna array vazio quando o repositório não retorna nenhuma
- [x] 2.2 Criar interface `IListBandsByUserUseCase` (`src/application/usecase/band/interfaces/list-bands-by-user.usecase.interface.ts`)
- [x] 2.3 Implementar `ListBandsByUserUseCase` (`src/application/usecase/band/list-bands-by-user.usecase.ts`), injetando `IBandRepository` e delegando para `findAllByUserId`
- [x] 2.4 Rodar os testes unitários e confirmar que passam

## 3. Infraestrutura (repositório)

- [x] 3.1 Escrever teste unitário para `BandRepository.findAllByUserId` (`test/unit/infrastructure/repository/band/band.repository.spec.ts`): retorna bandas unidas via `band_members` para um `user_id` informado, ordenadas por `created_at DESC`, retorna array vazio quando não há vínculo, exclui bandas que pertencem apenas a outros usuários
- [x] 3.2 Implementar `findAllByUserId` em `BandRepository` (`src/infrastructure/repository/band/band.repository.ts`) como um join entre `bands` e `band_members` filtrado por `user_id`
- [x] 3.3 Rodar os testes unitários e confirmar que passam

## 4. Compartilhado (response DTO)

- [x] 4.1 Escrever teste unitário para o mapper do response DTO (`test/unit/shared/communication/dtos/band/band-response.dto.spec.ts`): mapeia uma `BandEntity` (e uma lista delas) para o formato de resposta corretamente
- [x] 4.2 Criar `BandResponseDto` (`src/shared/communication/dtos/band/band-response.dto.ts`) com decorators `@ApiProperty` e um mapper estático (`fromEntity` / `fromEntities`)
- [x] 4.3 Escrever teste unitário para `ListBandsResponseDto` (`test/unit/shared/communication/dtos/band/list-bands-response.dto.spec.ts`): confirma que o envelope expõe a chave `data` com o array de `BandResponseDto` mapeado
- [x] 4.4 Criar `ListBandsResponseDto` (`src/shared/communication/dtos/band/list-bands-response.dto.ts`) com o atributo `data: BandResponseDto[]` (`@ApiProperty({ type: [BandResponseDto] })`), construído a partir de `BandResponseDto.fromEntities(bands)`
- [x] 4.5 Rodar os testes unitários e confirmar que passam

## 5. HTTP (controller + wiring do módulo)

- [x] 5.1 Escrever teste unitário para `BandController.list` (`test/unit/http/band/band.controller.spec.ts`, estendendo o arquivo existente): chama o use case com `request.user.id` e retorna um `ListBandsResponseDto` cuja chave `data` contém os `BandResponseDto[]` mapeados
- [x] 5.2 Adicionar handler `@Get()` `list()` em `BandController` (`src/http/band/band.controller.ts`), protegido por `JwtAuthGuard`, reaproveitando `AuthenticatedRequest`
- [x] 5.3 Adicionar decorator de Swagger para o endpoint (`src/http/band/decorators/list-bands.decorator.ts`), documentando resposta 200 com `ListBandsResponseDto` (envelope `{ data: BandResponseDto[] }`) e 401
- [x] 5.4 Conectar `ListBandsByUserUseCase` em `BandFactoryModule` (`src/http/band/band-factory.module.ts`) com um novo token e `useFactory`
- [x] 5.5 Rodar os testes unitários e confirmar que passam

## 6. Testes end-to-end

- [x] 6.1 Escrever teste e2e (`test/e2e/band/list.e2e-spec.ts`) cobrindo: usuário autenticado com bandas próprias e de participação recebe todas elas dentro de `body.data` (200), usuário sem nenhuma banda recebe `body.data` vazio (200), requisição não autenticada é rejeitada (401), bandas que pertencem apenas a outros usuários são excluídas de `body.data`
- [x] 6.2 Rodar os testes e2e e confirmar que passam

## 7. Cobertura e qualidade

- [x] 7.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions, lines) para todos os arquivos novos/alterados
- [x] 7.2 Rodar as checagens de lint/format e corrigir eventuais violações — `npm run lint` já falhava na branch `main` antes desta mudança (235 problemas em arquivos não tocados por ela); os arquivos novos/alterados desta mudança seguem os mesmos padrões (e apresentam os mesmos tipos de apontamento: `unbound-method` em asserções de mock do Jest, `no-unsafe-*` em `response.body` do Supertest) já presentes nos arquivos-irmãos existentes (`create.e2e-spec.ts`, `create-band.usecase.spec.ts`); nenhuma violação nova foi introduzida além do padrão já estabelecido
- [x] 7.3 Revisar o código novo em relação às regras de Object Calisthenics (sem `else`, um nível de indentação por método, sem abreviações) — revisão concluída, sem violações
