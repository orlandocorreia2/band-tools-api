#!/usr/bin/env node
/**
 * CLI para backup/restore fora do MCP, com as mesmas validações das tools.
 *
 *   node dist/cli.js backup  [diretorio]
 *   node dist/cli.js restore <arquivo.sql> [--yes]
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

// Carrega o .env da raiz do projeto antes de importar a config (que lê process.env no import).
// Variáveis já definidas no ambiente têm precedência.
const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const { config } = await import('./config.js');
const { resolveBackupFile, resolveOutputDir } = await import('./paths.js');
const { backupDatabase, restoreDatabase } = await import('./postgres.js');

const USAGE = `Uso:
  backup  [diretorio]            (padrão: primeiro diretório de ALLOWED_DIRS)
  restore <arquivo.sql> [--yes]  (sem --yes, pede confirmação digitando o nome do banco)`;

async function confirmRestore(): Promise<boolean> {
  if (!process.stdin.isTTY) return false;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(
      `ATENÇÃO: o banco "${config.database}" (container "${config.container}") será sobrescrito.\n` +
        `Digite o nome do banco para confirmar: `,
    );
    return answer.trim() === config.database;
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const yes = rest.includes('--yes');
  const target = rest.find((arg) => arg !== '--yes');

  switch (command) {
    case 'backup': {
      const dir = await resolveOutputDir(target ?? config.allowedDirs[0] ?? '', config.allowedDirs);
      console.log(`Gerando backup de "${config.database}"...`);
      const { filePath, size } = await backupDatabase(config, dir);
      console.log(`Backup concluído: ${filePath} (${size} bytes)`);
      return;
    }
    case 'restore': {
      if (!target) throw new Error(`Informe o arquivo .sql.\n${USAGE}`);
      const file = await resolveBackupFile(target, config.allowedDirs);
      if (!yes && !(await confirmRestore())) {
        throw new Error('Restore cancelado: confirmação não recebida.');
      }
      console.log(`Restaurando ${file.path} em "${config.database}"...`);
      await restoreDatabase(config, file.path);
      console.log('Restore concluído.');
      return;
    }
    default:
      throw new Error(USAGE);
  }
}

try {
  await main();
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
