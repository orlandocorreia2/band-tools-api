import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Config {
  readonly container: string;
  readonly user: string;
  readonly database: string;
  readonly password: string | undefined;
  readonly allowedDirs: readonly string[];
  readonly dockerCommand: string;
  readonly dockerCommandArgs: readonly string[];
  readonly backupTimeoutMs: number;
  readonly restoreTimeoutMs: number;
}

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Nomes de container, usuário e banco: apenas caracteres seguros (defense in depth,
// mesmo sem shell envolvido).
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,62}$/;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function safeName(name: string, value: string): string {
  if (!SAFE_NAME.test(value)) {
    throw new Error(`Valor inválido em ${name}: use apenas letras, números, "_", "-" ou "."`);
  }
  return value;
}

function positiveInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n <= 0) throw new Error(`Valor inválido em ${name}`);
  return n;
}

function loadConfig(): Config {
  // Diretórios onde backups podem ser gravados/lidos. Separador: ";" no Windows, ":" no Linux.
  const allowedDirsRaw = process.env.ALLOWED_DIRS?.trim();
  const allowedDirs = (allowedDirsRaw ? allowedDirsRaw.split(path.delimiter) : [path.join(PROJECT_ROOT, 'backups')])
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => path.resolve(d));

  // Comando para chamar o Docker. Ex. no Windows com Docker dentro do WSL:
  // DOCKER_COMMAND=wsl.exe  DOCKER_COMMAND_ARGS="-d Ubuntu -- docker"
  const dockerCommand = process.env.DOCKER_COMMAND?.trim() || 'docker';
  const dockerCommandArgs = (process.env.DOCKER_COMMAND_ARGS ?? '').split(/\s+/).filter(Boolean);

  return Object.freeze({
    container: safeName('PG_CONTAINER', required('PG_CONTAINER')),
    user: safeName('PG_USER', required('PG_USER')),
    database: safeName('PG_DATABASE', required('PG_DATABASE')),
    // Opcional: dentro do container o socket local costuma usar trust. Nunca vai para argv.
    password: process.env.PG_PASSWORD || undefined,
    allowedDirs,
    dockerCommand,
    dockerCommandArgs,
    backupTimeoutMs: positiveInt('BACKUP_TIMEOUT_MS', 10 * 60 * 1000),
    restoreTimeoutMs: positiveInt('RESTORE_TIMEOUT_MS', 30 * 60 * 1000),
  });
}

export const config: Config = loadConfig();
