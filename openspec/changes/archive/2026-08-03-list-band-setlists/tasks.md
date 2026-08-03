## 1. Domínio

- [x] 1.1 Escrever teste unitário cobrindo o uso do contrato `IBandSetlistRepository.findAllByBandId` (via fake/mock no spec do use case — ver seção 2)
- [x] 1.2 Adicionar `findAllByBandId(bandId: string): Promise<BandSetlistEntity[]>` em `IBandSetlistRepository` (`src/domain/repositories/band-setlist/band-setlist.repository.interface.ts`)

## 2. Aplicação (use case)

- [x] 2.1 Escrever teste unitário para `ListBandSetlistsUseCase` (`test/unit/application/usecase/band-setlist/list-band-setlists.usecase.spec.ts`): retorna os setlists do repositório para o `bandId` informado, retorna array vazio quando o repositório não retorna nenhum
- [x] 2.2 Criar interface `ListBandSetlistsUseCaseInterface` (`src/application/usecase/band-setlist/interfaces/list-band-setlists.usecase.interface.ts`)
- [x] 2.3 Implementar `ListBandSetlistsUseCase` (`src/application/usecase/band-setlist/list-band-setlists.usecase.ts`), injetando `IBandSetlistRepository` e delegando para `findAllByBandId`
- [x] 2.4 Rodar os testes unitários e confirmar que passam

## 3. Infraestrutura (repositório)

- [x] 3.1 Escrever teste unitário para `BandSetlistRepository.findAllByBandId` (`test/unit/infrastructure/repository/band-setlist/band-setlist.repository.spec.ts`): retorna setlists filtrados por `band_id`, ordenados por `created_at ASC`, retorna array vazio quando não há setlists, exclui setlists de outras bandas
- [x] 3.2 Implementar `findAllByBandId` em `BandSetlistRepository` (`src/infrastructure/repository/band-setlist/band-setlist.repository.ts`) filtrando por `band_id` e ordenando por `created_at ASC`
- [x] 3.3 Rodar os testes unitários e confirmar que passam

## 4. Compartilhado (response DTO)

- [x] 4.1 Escrever teste unitário para o mapper do response DTO (`test/unit/shared/communication/dtos/band-setlist/band-setlist-response.dto.spec.ts`): mapeia uma `BandSetlistEntity` (e uma lista delas) para o formato de resposta corretamente
- [x] 4.2 Criar `BandSetlistResponseDto` (`src/shared/communication/dtos/band-setlist/band-setlist-response.dto.ts`) com decorators `@ApiProperty` e um mapper estático (`fromEntity` / `fromEntities`)
- [x] 4.3 Escrever teste unitário para `ListBandSetlistsResponseDto` (`test/unit/shared/communication/dtos/band-setlist/list-band-setlists-response.dto.spec.ts`): confirma que o envelope expõe a chave `data` com o array de `BandSetlistResponseDto` mapeado
- [x] 4.4 Criar `ListBandSetlistsResponseDto` (`src/shared/communication/dtos/band-setlist/list-band-setlists-response.dto.ts`) com o atributo `data: BandSetlistResponseDto[]` (`@ApiProperty({ type: [BandSetlistResponseDto] })`), construído a partir de `BandSetlistResponseDto.fromEntities(bandSetlists)`
- [x] 4.5 Rodar os testes unitários e confirmar que passam

## 5. HTTP (controller + wiring do módulo)

- [x] 5.1 Escrever teste unitário para `BandSetlistController.list` (`test/unit/http/band-setlist/band-setlist.controller.spec.ts`, estendendo o arquivo existente): chama o use case com `params.id` e retorna um `ListBandSetlistsResponseDto` cuja chave `data` contém os `BandSetlistResponseDto[]` mapeados
- [x] 5.2 Adicionar handler `@Get(':id/setlists')` `list()` em `BandSetlistController` (`src/http/band-setlist/band-setlist.controller.ts`), reaproveitando `FindIdParamDto` e os guards `JwtAuthGuard`/`AuthUserIsMemberBandGuard` já aplicados na classe
- [x] 5.3 Adicionar decorator de Swagger para o endpoint (`src/http/band-setlist/decorators/list-band-setlists.decorator.ts`), documentando resposta 200 com `ListBandSetlistsResponseDto` (envelope `{ data: BandSetlistResponseDto[] }`), 401, 403 e 404
- [x] 5.4 Conectar `ListBandSetlistsUseCase` em `BandSetlistFactoryModule` (`src/http/band-setlist/band-setlist-factory.module.ts`) com um novo token e `useFactory`
- [x] 5.5 Rodar os testes unitários e confirmar que passam

## 6. Testes end-to-end

- [x] 6.1 Escrever teste e2e (`test/e2e/band-setlist/list.e2e-spec.ts`) cobrindo: usuário autenticado e membro recebe todos os setlists da banda dentro de `body.data` (200), banda sem setlists recebe `body.data` vazio (200), setlists de outras bandas são excluídos de `body.data`, banda inexistente retorna 404, usuário autenticado inexistente na base retorna 404, usuário não-membro retorna 403, requisição não autenticada retorna 401
- [x] 6.2 Rodar os testes e2e e confirmar que passam

## 7. Cobertura e qualidade

- [x] 7.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions, lines) para todos os arquivos novos/alterados
- [x] 7.2 Rodar as checagens de lint/format e corrigir eventuais violações introduzidas por esta mudança
- [x] 7.3 Revisar o código novo em relação às regras de Object Calisthenics (sem `else`, um nível de indentação por método, sem abreviações)
