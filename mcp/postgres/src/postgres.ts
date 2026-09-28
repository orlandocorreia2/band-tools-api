import { spawn } from 'node:child_process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import type { Config } from './config.js';

export interface BackupResult {
  filePath: string;
  size: number;
}

interface RunOptions {
  stdin?: Readable;
  stdout?: Writable;
  timeoutMs: number;
}

const MAX_STDERR = 16 * 1024;

function reasonText(reason: unknown): string {
  if (reason instanceof Error) {
    return 'code' in reason && reason.code ? String(reason.code) : reason.message;
  }
  return String(reason);
}

function timestamp(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
}

function childEnv(config: Config): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.PG_PASSWORD;
  if (config.password) {
    env.PGPASSWORD = config.password;
    // wsl.exe só repassa variáveis do Windows listadas em WSLENV.
    if (/^wsl(\.exe)?$/i.test(path.basename(config.dockerCommand))) {
      env.WSLENV = [env.WSLENV, 'PGPASSWORD/u'].filter(Boolean).join(':');
    }
  }
  return env;
}

function dockerExecArgs(config: Config, { interactive }: { interactive: boolean }): string[] {
  const args = [...config.dockerCommandArgs, 'exec'];
  if (interactive) args.push('-i');
  // "-e PGPASSWORD" sem valor: o docker lê do próprio ambiente, a senha não aparece em argv.
  if (config.password) args.push('-e', 'PGPASSWORD');
  args.push(config.container);
  return args;
}

/**
 * Mantém só as linhas ERROR/FATAL do stderr. DETAIL/CONTEXT podem conter valores de
 * linhas do banco (PII), então não são devolvidos ao cliente.
 */
function summarizeStderr(stderr: string): string {
  const lines = stderr
    .split(/\r?\n/)
    .filter((l) => /^(pg_dump: error|psql:.*(ERROR|FATAL)|ERROR|FATAL|Error)/i.test(l.trim()))
    .slice(0, 3)
    .map((l) => l.slice(0, 300));
  return lines.length ? lines.join('\n') : 'falha sem mensagem de erro identificável (veja os logs do container)';
}

function run(config: Config, args: string[], { stdin, stdout, timeoutMs }: RunOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(config.dockerCommand, args, {
      env: childEnv(config),
      shell: false,
      windowsHide: true,
      stdio: [stdin ? 'pipe' : 'ignore', 'pipe', 'pipe'],
    });

    const { stdout: childStdout, stderr: childStderr } = child;
    if (!childStdout || !childStderr) {
      child.kill('SIGKILL');
      reject(new Error('Falha ao abrir os pipes do processo docker'));
      return;
    }

    let stderr = '';
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    childStderr.on('data', (chunk: Buffer) => {
      if (stderr.length < MAX_STDERR) stderr += chunk.toString('utf8');
    });

    const streams: Promise<void>[] = [];
    if (stdin && child.stdin) streams.push(pipeline(stdin, child.stdin));
    if (stdout) streams.push(pipeline(childStdout, stdout));
    else childStdout.resume();

    const exited = new Promise<number | null>((res, rej) => {
      child.on('error', rej);
      child.on('close', (code) => res(code));
    });

    void Promise.allSettled([exited, ...streams]).then(([exit, ...pipes]) => {
      clearTimeout(timer);
      if (!exit || exit.status === 'rejected') {
        return reject(new Error(`Não foi possível executar "${config.dockerCommand}": ${reasonText(exit?.reason)}`));
      }
      if (timedOut) return reject(new Error(`Tempo limite excedido (${timeoutMs} ms)`));
      if (exit.value !== 0) return reject(new Error(summarizeStderr(stderr)));
      const failedPipe = pipes.find((p): p is PromiseRejectedResult => p.status === 'rejected');
      if (failedPipe) return reject(new Error(`Falha de I/O: ${reasonText(failedPipe.reason)}`));
      resolve();
    });
  });
}

export async function backupDatabase(config: Config, outputDir: string): Promise<BackupResult> {
  const fileName = `${config.database}_${timestamp()}.sql`;
  const filePath = path.join(outputDir, fileName);

  // "wx": nunca sobrescreve um arquivo existente. 0o600: só o dono lê o dump.
  const out = fs.createWriteStream(filePath, { flags: 'wx', mode: 0o600 });
  await new Promise<void>((res, rej) => {
    out.once('open', () => res());
    out.once('error', rej);
  });

  const args = [
    ...dockerExecArgs(config, { interactive: false }),
    'pg_dump',
    '--username', config.user,
    '--dbname', config.database,
    '--format', 'plain',
    '--clean',
    '--if-exists',
    '--no-password',
    '--encoding', 'UTF8',
  ];

  try {
    await run(config, args, { stdout: out, timeoutMs: config.backupTimeoutMs });
  } catch (err) {
    out.destroy();
    await fsp.rm(filePath, { force: true });
    throw new Error(`Backup falhou: ${reasonText(err)}`);
  }

  const { size } = await fsp.stat(filePath);
  return { filePath, size };
}

/**
 * Um .sql plain é executado pelo psql, que aceita meta-comandos como "\!" (shell no
 * container). Dumps do pg_dump >= 16.10/17.6 começam com "\restrict <chave>", que faz o
 * psql recusar qualquer meta-comando até "\unrestrict <chave>" (CVE-2025-8714).
 * Aceitamos só arquivos em que isso protege o arquivo inteiro.
 */
async function assertRestrictedDump(filePath: string): Promise<void> {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let key: string | null = null;
  let unrestrictCount = 0;
  let lastNonEmpty = '';

  for await (const line of rl) {
    const trimmed = line.trim();
    if (key === null) {
      if (trimmed === '' || trimmed.startsWith('--')) continue;
      const match = /^\\restrict ([A-Za-z0-9]+)$/.exec(trimmed);
      if (!match?.[1]) {
        rl.close();
        throw new Error(
          'Arquivo recusado: o dump não começa com "\\restrict". Gere o backup com pg_dump >= 16.10 (ex.: pela tool backup_database).',
        );
      }
      key = match[1];
      continue;
    }
    if (line.includes('\\unrestrict')) unrestrictCount += 1;
    if (trimmed !== '') lastNonEmpty = trimmed;
  }

  if (key === null) throw new Error('Arquivo recusado: nenhum conteúdo SQL encontrado');
  if (unrestrictCount !== 1 || lastNonEmpty !== `\\unrestrict ${key}`) {
    throw new Error('Arquivo recusado: "\\unrestrict" ausente, duplicado ou fora do final do arquivo');
  }
}

export async function restoreDatabase(config: Config, filePath: string): Promise<void> {
  await assertRestrictedDump(filePath);

  const args = [
    ...dockerExecArgs(config, { interactive: true }),
    'psql',
    '--username', config.user,
    '--dbname', config.database,
    '--no-password',
    '--no-psqlrc',
    '--quiet',
    '--single-transaction',
    '--set', 'ON_ERROR_STOP=1',
  ];

  try {
    await run(config, args, { stdin: fs.createReadStream(filePath), timeoutMs: config.restoreTimeoutMs });
  } catch (err) {
    throw new Error(`Restore falhou (transação revertida): ${reasonText(err)}`);
  }
}

// Tabelas de usuário (comuns e particionadas), sem catálogos do sistema, sem partições
// (caem junto com a tabela-mãe) e sem tabelas de extensões (ex.: spatial_ref_sys do PostGIS).
const USER_TABLES_FILTER = `
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relkind IN ('r', 'p')
    AND NOT c.relispartition
    AND n.nspname <> 'information_schema'
    AND n.nspname !~ '^pg_'
    AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype = 'e')`;

// SQL fixo, sem nenhum input do usuário. O SELECT roda antes do DROP, na mesma transação.
const DROP_ALL_TABLES_SQL = `
SELECT count(*) ${USER_TABLES_FILTER};
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT n.nspname, c.relname ${USER_TABLES_FILTER}
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', r.nspname, r.relname);
  END LOOP;
END $$;
`;

/** Exclui todas as tabelas de usuário do banco em uma transação única. Retorna quantas foram excluídas. */
export async function dropAllTables(config: Config): Promise<number> {
  const args = [
    ...dockerExecArgs(config, { interactive: true }),
    'psql',
    '--username', config.user,
    '--dbname', config.database,
    '--no-password',
    '--no-psqlrc',
    '--quiet',
    '--tuples-only',
    '--no-align',
    '--single-transaction',
    '--set', 'ON_ERROR_STOP=1',
  ];

  const chunks: Buffer[] = [];
  const out = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(chunk);
      callback();
    },
  });

  try {
    await run(config, args, { stdin: Readable.from([DROP_ALL_TABLES_SQL]), stdout: out, timeoutMs: config.restoreTimeoutMs });
  } catch (err) {
    throw new Error(`Exclusão das tabelas falhou (transação revertida): ${reasonText(err)}`);
  }

  const count = Number.parseInt(Buffer.concat(chunks).toString('utf8').trim(), 10);
  return Number.isInteger(count) ? count : 0;
}
