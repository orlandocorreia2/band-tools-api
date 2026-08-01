## Why

As bandas precisam manter um repertório organizado das músicas que tocam, registrando informações técnicas (afinação, tonalidade, BPM, duração), a letra e observações livres. Hoje não existe nenhuma estrutura para cadastrar músicas vinculadas a uma banda, o que impede o controle do repertório dentro da aplicação.

## What Changes

- Criação da entidade de domínio `BandSongEntity`, representando uma música do repertório de uma banda
- Criação da migration `band_songs`, com `band_id` como chave estrangeira para `bands.id` (`ON DELETE CASCADE`)
- Novo endpoint `POST /bands/:id/song` para cadastrar uma música no repertório de uma banda
- Validação de que o campo `title` é obrigatório; todos os demais campos (`tuning`, `tonality`, `bpm`, `duration`, `lyrics`, `notes`) são opcionais
- Verificação de que o usuário autenticado (identificado via JWT) ainda existe na tabela `users`
- Verificação de que o usuário autenticado é membro da banda informada em `:id` (via `band_members`); caso contrário, o cadastro é recusado
- Verificação de que a banda informada em `:id` existe

## Capabilities

### New Capabilities
- `band-repertoire`: cadastro de músicas do repertório de uma banda, incluindo dados técnicos (afinação, tonalidade, BPM, duração), letra e observações, com validação de título obrigatório e de vínculo do usuário autenticado com a banda

### Modified Capabilities
_Nenhuma capacidade existente tem seus requisitos alterados. A capacidade `band-membership` pode ganhar um novo método de consulta (verificar se um usuário é membro de uma banda) para suportar esta feature, mas isso é detalhe de implementação, não mudança de requisito._

## Impact

- **Domínio**: nova entidade `BandSongEntity` (`src/domain/entities/band-song/`), nova interface `IBandSongRepository`
- **Infraestrutura**: nova migration `create-band-songs-table`, nova TypeORM entity `BandSongTypeormEntity`, novo `BandSongRepository`
- **Aplicação**: novo use case `CreateBandSongUseCase`, dependente apenas de `IBandSongRepository` (monta e persiste a `BandSongEntity`)
- **HTTP**: novo `BandSongController` (rota `POST /bands/:id/song`), nova `BandSongFactoryModule`, novo `CreateBandSongDto`, novo guard `AuthUserIsMemberBandGuard` (`src/http/middlewares/`) responsável pelas validações de existência da banda, existência do usuário autenticado e vínculo de membership
- **Repositórios existentes**: `IBandMemberRepository` ganha um método para verificar se um usuário é membro de uma banda (`existsByBandAndUser` ou equivalente)
