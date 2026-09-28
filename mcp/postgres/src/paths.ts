import fs from 'node:fs/promises';
import path from 'node:path';

export interface BackupFile {
  path: string;
  size: number;
}

function isInside(child: string, parent: string): boolean {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function errorCode(err: unknown): string | undefined {
  return err instanceof Error && 'code' in err ? String(err.code) : undefined;
}

async function realAllowedDirs(allowedDirs: readonly string[]): Promise<string[]> {
  const resolved: string[] = [];
  for (const dir of allowedDirs) {
    await fs.mkdir(dir, { recursive: true });
    resolved.push(await fs.realpath(dir));
  }
  return resolved;
}

/**
 * Garante que `target` (já existente) está dentro de algum diretório permitido.
 * Usa realpath para neutralizar "..", symlinks e junctions.
 */
async function assertAllowed(target: string, allowedDirs: readonly string[]): Promise<string> {
  const real = await fs.realpath(target);
  const roots = await realAllowedDirs(allowedDirs);
  if (!roots.some((root) => isInside(real, root))) {
    throw new Error(`Caminho fora dos diretórios permitidos (ALLOWED_DIRS): ${roots.join(', ')}`);
  }
  return real;
}

export async function resolveOutputDir(dir: string, allowedDirs: readonly string[]): Promise<string> {
  const absolute = path.resolve(dir);
  // Checagem léxica antes de criar qualquer coisa no disco.
  if (!allowedDirs.some((root) => isInside(absolute, root))) {
    throw new Error(`Diretório fora dos diretórios permitidos (ALLOWED_DIRS): ${allowedDirs.join(', ')}`);
  }
  await fs.mkdir(absolute, { recursive: true });
  const real = await assertAllowed(absolute, allowedDirs);
  const stat = await fs.stat(real);
  if (!stat.isDirectory()) throw new Error('O caminho informado não é um diretório');
  return real;
}

export async function resolveBackupFile(file: string, allowedDirs: readonly string[]): Promise<BackupFile> {
  const absolute = path.resolve(file);
  if (path.extname(absolute).toLowerCase() !== '.sql') {
    throw new Error('O arquivo de backup deve ter extensão .sql');
  }
  let real: string;
  try {
    real = await assertAllowed(absolute, allowedDirs);
  } catch (err) {
    if (errorCode(err) === 'ENOENT') throw new Error('Arquivo de backup não encontrado');
    throw err;
  }
  const stat = await fs.stat(real);
  if (!stat.isFile()) throw new Error('O caminho informado não é um arquivo');
  if (stat.size === 0) throw new Error('O arquivo de backup está vazio');
  return { path: real, size: stat.size };
}
