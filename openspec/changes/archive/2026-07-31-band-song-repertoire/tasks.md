## 1. Migration

- [x] 1.1 Gerar/criar migration `create-band-songs-table` com a tabela `band_songs`: `id` (uuid, pk), `band_id` (uuid, fk `bands.id`, `ON DELETE CASCADE`), `title` (varchar, not null), `tuning` (varchar, nullable), `tonality` (varchar, nullable), `bpm` (integer, nullable), `duration` (integer, nullable), `lyrics` (text, nullable), `notes` (varchar, nullable), `created_at`, `updated_at` (timestamptz)
- [x] 1.2 Adicionar índice em `band_id`
- [x] 1.3 Escrever teste unitário da migration (`up`/`down`), seguindo o padrão de `1784651680416-create-band-members-table.spec.ts`
- [x] 1.4 Rodar `npm run migration:run` localmente e validar a criação da tabela

## 2. Domínio

- [x] 2.1 Criar `BandSongEntity` em `src/domain/entities/band-song/band-song.entity.ts` (campos: `band_id`, `title`, `tuning?`, `tonality?`, `bpm?`, `duration?`, `lyrics?`, `notes?`), estendendo `BaseEntity`
- [x] 2.2 Escrever teste unitário de `BandSongEntity` (defaults, campos opcionais ausentes)
- [x] 2.3 Criar `IBandSongRepository` em `src/domain/repositories/band-song/band-song.repository.interface.ts` com `save(bandSong: BandSongEntity): Promise<void>`
- [x] 2.4 Adicionar `findById(id: string): Promise<BandEntity | null>` em `IBandRepository`
- [x] 2.5 Adicionar `existsByBandAndUser(bandId: string, userId: string): Promise<boolean>` em `IBandMemberRepository`

## 3. Infraestrutura

- [x] 3.1 Criar `BandSongTypeormEntity` em `src/infrastructure/entities/band-song/band-song-typeorm.entity.ts`, mapeando a tabela `band_songs`
- [x] 3.2 Criar `BandSongRepository` implementando `IBandSongRepository`
- [x] 3.3 Escrever teste unitário de `BandSongRepository`
- [x] 3.4 Implementar `findById` em `BandRepository`
- [x] 3.5 Escrever teste unitário para `BandRepository.findById`
- [x] 3.6 Implementar `existsByBandAndUser` em `BandMemberRepository`
- [x] 3.7 Escrever teste unitário para `BandMemberRepository.existsByBandAndUser`

## 4. DTO

- [x] 4.1 Criar `CreateBandSongDto` em `src/shared/communication/dtos/band-song/create-band-song.dto.ts` com `title` obrigatório (`@IsString`, `@MinLength(1)`) e `tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes` opcionais (`@IsOptional`), com decorators de tipo e `@ApiProperty`/`@ApiPropertyOptional`
- [x] 4.2 Escrever teste unitário do DTO (validação de cada campo obrigatório/opcional, tipos inválidos)

## 5. Aplicação (Use Case)

- [x] 5.1 Criar `CreateBandSongUseCaseInterface` em `src/application/usecase/band-song/interfaces/`
- [x] 5.2 Criar `CreateBandSongUseCase` que recebe `bandId`, `dto` e `userId`, e executa nesta ordem: (1) `IBandRepository.findById` → `ApplicationNotFoundException` se ausente; (2) `IUserRepository.findBy({ id: userId })` → `ApplicationNotFoundException` se ausente; (3) `IBandMemberRepository.existsByBandAndUser` → `ApplicationForbiddenException` se `false`; (4) monta `BandSongEntity` e chama `IBandSongRepository.save`
- [x] 5.3 Escrever testes unitários do use case cobrindo: sucesso (todos os campos), sucesso (somente `title`), banda inexistente, usuário inexistente, usuário não membro

## 6. HTTP

- [x] 6.1 Criar `BandSongController` em `src/http/band-song/band-song.controller.ts` com `@Controller('bands')`, `@UseGuards(JwtAuthGuard)` e método `POST :id/song`, retornando 201 sem corpo
- [x] 6.2 Documentar respostas Swagger: 201, 400, 401, 403, 404, 422, 500
- [x] 6.3 Criar `BandSongFactoryModule` em `src/http/band-song/band-song-factory.module.ts`, com `useFactory` para `CreateBandSongUseCase`, injetando `BandSongRepository`, `BandRepository`, `BandMemberRepository` e `UserRepository`
- [x] 6.4 Registrar `BandSongFactoryModule` no módulo raiz da aplicação
- [x] 6.5 Escrever testes unitários de `BandSongController` e `BandSongFactoryModule`

## 7. Testes e2e

- [x] 7.1 Escrever teste e2e cobrindo: cadastro com sucesso (somente obrigatório e completo), corpo malformado (400), campo obrigatório ausente (422), banda inexistente (404), usuário autenticado removido da base (404), usuário não membro da banda (403), requisição sem token (401)

## 8. Finalização

- [x] 8.1 Rodar `npm run test` e `npm run test:cov` garantindo 100% de cobertura
- [x] 8.2 Rodar `npm run test:e2e`
- [x] 8.3 Rodar lint/format (`npm run lint`, `npm run format` se aplicável)
- [x] 8.4 Commit seguindo Conventional Commits
