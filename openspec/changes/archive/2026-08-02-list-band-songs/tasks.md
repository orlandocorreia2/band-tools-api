## 1. Domínio

- [x] 1.1 Escrever teste unitário cobrindo o uso do contrato `IBandSongRepository.findAllByBandId` (via fake/mock no spec do use case — ver seção 2)
- [x] 1.2 Adicionar `findAllByBandId(bandId: string): Promise<BandSongEntity[]>` em `IBandSongRepository` (`src/domain/repositories/band-song/band-song.repository.interface.ts`)

## 2. Aplicação (use case)

- [x] 2.1 Escrever teste unitário para `ListBandSongsUseCase` (`test/unit/application/usecase/band-song/list-band-songs.usecase.spec.ts`): retorna as músicas do repositório para o `bandId` informado, retorna array vazio quando o repositório não retorna nenhuma
- [x] 2.2 Criar interface `ListBandSongsUseCaseInterface` (`src/application/usecase/band-song/interfaces/list-band-songs.usecase.interface.ts`)
- [x] 2.3 Implementar `ListBandSongsUseCase` (`src/application/usecase/band-song/list-band-songs.usecase.ts`), injetando `IBandSongRepository` e delegando para `findAllByBandId`
- [x] 2.4 Rodar os testes unitários e confirmar que passam

## 3. Infraestrutura (repositório)

- [x] 3.1 Escrever teste unitário para `BandSongRepository.findAllByBandId` (`test/unit/infrastructure/repository/band-song/band-song.repository.spec.ts`): retorna músicas filtradas por `band_id`, ordenadas por `created_at ASC`, retorna array vazio quando não há músicas, exclui músicas de outras bandas
- [x] 3.2 Implementar `findAllByBandId` em `BandSongRepository` (`src/infrastructure/repository/band-song/band-song.repository.ts`) filtrando por `band_id` e ordenando por `created_at ASC`
- [x] 3.3 Rodar os testes unitários e confirmar que passam

## 4. Compartilhado (response DTO)

- [x] 4.1 Escrever teste unitário para o mapper do response DTO (`test/unit/shared/communication/dtos/band-song/band-song-response.dto.spec.ts`): mapeia uma `BandSongEntity` (e uma lista delas) para o formato de resposta corretamente
- [x] 4.2 Criar `BandSongResponseDto` (`src/shared/communication/dtos/band-song/band-song-response.dto.ts`) com decorators `@ApiProperty`/`@ApiPropertyOptional` e um mapper estático (`fromEntity` / `fromEntities`)
- [x] 4.3 Escrever teste unitário para `ListBandSongsResponseDto` (`test/unit/shared/communication/dtos/band-song/list-band-songs-response.dto.spec.ts`): confirma que o envelope expõe a chave `data` com o array de `BandSongResponseDto` mapeado
- [x] 4.4 Criar `ListBandSongsResponseDto` (`src/shared/communication/dtos/band-song/list-band-songs-response.dto.ts`) com o atributo `data: BandSongResponseDto[]` (`@ApiProperty({ type: [BandSongResponseDto] })`), construído a partir de `BandSongResponseDto.fromEntities(bandSongs)`
- [x] 4.5 Rodar os testes unitários e confirmar que passam

## 5. HTTP (controller + wiring do módulo)

- [x] 5.1 Escrever teste unitário para `BandSongController.list` (`test/unit/http/band-song/band-song.controller.spec.ts`, estendendo o arquivo existente): chama o use case com `params.id` e retorna um `ListBandSongsResponseDto` cuja chave `data` contém os `BandSongResponseDto[]` mapeados
- [x] 5.2 Adicionar handler `@Get(':id/songs')` `list()` em `BandSongController` (`src/http/band-song/band-song.controller.ts`), reaproveitando `FindIdParamDto` e os guards `JwtAuthGuard`/`AuthUserIsMemberBandGuard` já aplicados na classe
- [x] 5.2.1 **BREAKING**: renomear a rota de cadastro de `@Post(':id/song')` para `@Post(':id/songs')` em `BandSongController`, unificando o nome do recurso com a rota de listagem; atualizar `test/e2e/band-song/create.e2e-spec.ts` e o helper de criação em `test/e2e/band-song/list.e2e-spec.ts` para a rota plural
- [x] 5.3 Adicionar decorator de Swagger para o endpoint (`src/http/band-song/decorators/list-band-songs.decorator.ts`), documentando resposta 200 com `ListBandSongsResponseDto` (envelope `{ data: BandSongResponseDto[] }`), 401, 403 e 404
- [x] 5.4 Conectar `ListBandSongsUseCase` em `BandSongFactoryModule` (`src/http/band-song/band-song-factory.module.ts`) com um novo token e `useFactory`
- [x] 5.5 Rodar os testes unitários e confirmar que passam

## 6. Testes end-to-end

- [x] 6.1 Escrever teste e2e (`test/e2e/band-song/list.e2e-spec.ts`) cobrindo: usuário autenticado e membro recebe todas as músicas da banda dentro de `body.data` (200), banda sem músicas recebe `body.data` vazio (200), músicas de outras bandas são excluídas de `body.data`, banda inexistente retorna 404, usuário autenticado inexistente na base retorna 404, usuário não-membro retorna 403, requisição não autenticada retorna 401
- [x] 6.2 Rodar os testes e2e e confirmar que passam

## 7. Cobertura e qualidade

- [x] 7.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions, lines) para todos os arquivos novos/alterados
- [x] 7.2 Rodar as checagens de lint/format e corrigir eventuais violações introduzidas por esta mudança
- [x] 7.3 Revisar o código novo em relação às regras de Object Calisthenics (sem `else`, um nível de indentação por método, sem abreviações)
