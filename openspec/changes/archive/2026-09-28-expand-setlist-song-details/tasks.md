# Tasks

## 1. DTO de resposta (TDD)

- [x] 1.1 Red: em `test/unit/shared/communication/dtos/band/setlist-song-response.dto.spec.ts`, atualizar o teste de `fromEntity` para uma música com `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes` preenchidos, esperando esses valores no DTO. Adicionar um teste para uma música só com `title`, esperando os seis campos iguais a `null`. Verificar com `npm run test -- setlist-song-response.dto` que os novos testes falham.
- [x] 1.2 Green: em `src/shared/communication/dtos/band/setlist-song-response.dto.ts`, adicionar os campos `readonly tuning: string | null`, `tonality: string | null`, `bpm: number | null`, `duration: number | null`, `lyrics: string | null` e `notes: string | null`, atribuídos no construtor como `bandSong.<campo> ?? null`. Verificar com `npm run test -- setlist-song-response.dto` que tudo passa.
- [x] 1.3 Documentar os seis campos com `@ApiPropertyOptional({ example, nullable: true })`, usando os mesmos exemplos de `BandSongResponseDto`. Verificar no Swagger/Scalar local (`npm run start:dev`) que o schema de `SetlistSongResponseDto` mostra os novos campos como nullable.
- [x] 1.4 Confirmar que `test/unit/shared/communication/dtos/band/list-setlist-songs-response.dto.spec.ts` e `test/unit/http/band/band-setlist-song.controller.spec.ts` continuam passando sem alteração (`npm run test -- setlist-songs`).

## 2. Testes e2e

- [x] 2.1 Em `test/e2e/band-setlist-song/list.e2e-spec.ts`, adicionar um cenário que cadastra uma música com `tuning`, `tonality`, `bpm`, `duration`, `lyrics` e `notes`, associa ao setlist e verifica que o item retornado contém esses valores. Verificar com `npm run test:e2e -- band-setlist-song/list`.
- [x] 2.2 No mesmo arquivo, adicionar ao cenário existente (músicas cadastradas só com `title`) a verificação de que os seis campos vêm `null`, que o item não tem `band_id` e que `created_at`/`updated_at` são os do vínculo. Verificar com `npm run test:e2e -- band-setlist-song/list`.

## 3. Verificação final

- [x] 3.1 Rodar `npm run test:cov` e confirmar 100% de cobertura (statements, branches, functions e lines), incluindo os branches de `?? null`.
  > 100% com `--testPathIgnorePatterns health-check`. A suíte `health-check.controller.spec.ts` falha por alteração local fora desta change (chamada real à Gemini API sem credenciais).
- [x] 3.2 Rodar `npm run test:e2e` e confirmar que todos os cenários passam.
- [x] 3.3 Rodar `npm run lint` e confirmar que não há erros.
  > 0 erros nos arquivos desta change. O projeto já tinha erros de lint em outros arquivos (principalmente `no-unsafe-*` nos e2e), fora do escopo.
