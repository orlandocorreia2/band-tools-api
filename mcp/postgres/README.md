# mcp-postgres-docker

MCP server local (stdio) para **backup**, **restore** e **exclusão de tabelas** de um PostgreSQL que roda em Docker.

| Tool | Parâmetros | O que faz |
|---|---|---|
| `backup_database` | `output_dir` | Roda `pg_dump` (formato plain) dentro do container e salva `<db>_<AAAAMMDD-HHMMSS>.sql` no diretório informado |
| `restore_database` | `backup_file`, `confirm` | Executa o `.sql` via `psql` em **transação única** (`ON_ERROR_STOP`). Se der erro, tudo é desfeito. Exige `confirm: true` |
| `drop_all_tables` | `confirm_database` | Faz backup automático em `scripts/` (raiz do projeto) e depois `DROP TABLE ... CASCADE` em todas as tabelas de usuário (todos os schemas), em **transação única**. Exige `confirm_database` igual ao nome do banco |

## Instalação e build

Código em TypeScript (`src/`, `strict`), compilado para `dist/`.

```bash
npm install
npm run build        # tsc -p .
npm audit --omit=dev
```

> **Windows abrindo o projeto via `\\wsl.localhost\...`**: o `cmd.exe`, usado pelos scripts do npm, não aceita caminho UNC, então `npm run build` falha. Rode o compilador direto:
>
> ```powershell
> node "\\wsl.localhost\Ubuntu\home\orlando\projects\IA\mcp\postgres\node_modules\typescript\bin\tsc" -p "\\wsl.localhost\Ubuntu\home\orlando\projects\IA\mcp\postgres"
> ```
>
> O projeto fixa o **TypeScript 6.0.x** porque o TS 7, compilador nativo em Go, não consegue listar diretórios em caminhos UNC.

## Configuração (variáveis de ambiente)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PG_CONTAINER` | sim | Nome do container (ex.: `band-tools-postgres`) |
| `PG_USER` | sim | Usuário do Postgres |
| `PG_DATABASE` | sim | Banco alvo do backup/restore |
| `PG_PASSWORD` | não | Só se o socket local do container exigir senha. Passada por env, nunca em argv |
| `ALLOWED_DIRS` | recomendado | Diretórios onde backups podem ser gravados/lidos (`;` no Windows, `:` no Linux). Padrão: `./backups` |
| `DOCKER_COMMAND` | não | Padrão `docker`. No Windows com Docker dentro do WSL: `wsl.exe` |
| `DOCKER_COMMAND_ARGS` | não | Prefixo de argumentos. No caso do WSL: `-d Ubuntu -- docker` |
| `BACKUP_TIMEOUT_MS` / `RESTORE_TIMEOUT_MS` | não | Padrão 10 min / 30 min |

### Claude Code (Windows + Docker no WSL)

`.mcp.json` na raiz do projeto em que você vai usar o MCP:

```json
{
  "mcpServers": {
    "postgres-backup": {
      "command": "node",
      "args": ["\\\\wsl.localhost\\Ubuntu\\home\\orlando\\projects\\IA\\mcp\\postgres\\dist\\index.js"],
      "env": {
        "PG_CONTAINER": "band-tools-postgres",
        "PG_USER": "band_tools",
        "PG_DATABASE": "band_tools_db",
        "DOCKER_COMMAND": "wsl.exe",
        "DOCKER_COMMAND_ARGS": "-d Ubuntu -- docker",
        "ALLOWED_DIRS": "C:\\backups\\postgres"
      }
    }
  }
}
```

Ou via CLI:

```bash
claude mcp add postgres-backup \
  -e PG_CONTAINER=band-tools-postgres -e PG_USER=band_tools -e PG_DATABASE=band_tools_db \
  -e DOCKER_COMMAND=wsl.exe -e "DOCKER_COMMAND_ARGS=-d Ubuntu -- docker" \
  -e "ALLOWED_DIRS=C:\backups\postgres" \
  -- node "\\wsl.localhost\Ubuntu\home\orlando\projects\IA\mcp\postgres\dist\index.js"
```

Se o Node estiver instalado **dentro do WSL**, omita `DOCKER_COMMAND*` e use caminhos Linux em `ALLOWED_DIRS`.

## Segurança

- **Sem shell**: `spawn` com args em array. Nenhum input vira comando, o que impede command injection.
- **Allowlist de diretórios**: os caminhos são resolvidos com `realpath`, o que bloqueia `..`, symlinks e junctions fora de `ALLOWED_DIRS`.
- **Backups**: são criados com `mode 0600` e flag `wx`, então nunca sobrescrevem um arquivo existente. Se o backup falhar, o arquivo parcial é removido.
- **Restore protegido contra meta-comandos do psql**: um `.sql` pode conter `\! comando`, que roda shell no container. Por isso o restore só aceita dumps que começam com `\restrict <chave>` e terminam com um único `\unrestrict <chave>`. É o mecanismo do pg_dump ≥ 16.10/17.6 (CVE-2025-8714), e com ele o psql recusa qualquer meta-comando no meio do arquivo. Dumps antigos são recusados: gere um novo backup com a tool.
- **Restore destrutivo**: o dump usa `--clean --if-exists`, então os objetos existentes são substituídos. Exige `confirm: true`. Restaure apenas arquivos de origem confiável.
- **Exclusão de tabelas**: SQL fixo, sem input do usuário. A confirmação exige o **nome do banco**, não um booleano. Sempre gera um backup antes: se ele falhar, nada é excluído. Views e FKs dependentes caem junto (`CASCADE`). Catálogos do sistema, partições e tabelas de extensões são ignorados. Sequences avulsas, functions e types não são removidos.
- **Erros**: o cliente recebe só as linhas `ERROR`/`FATAL`, truncadas. `DETAIL` e `CONTEXT` podem conter valores de linhas (PII) e não são repassados. Logs vão para stderr, sem senha nem dados.
- **Backups contêm dados do banco**: trate os `.sql` como confidenciais (LGPD). Eles estão no `.gitignore`. Para dados de produção, guarde em volume criptografado ou storage com controle de acesso.
