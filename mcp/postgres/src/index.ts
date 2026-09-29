#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { config } from './config.js';
import { resolveBackupFile, resolveOutputDir } from './paths.js';
import { backupDatabase, dropAllTables, restoreDatabase } from './postgres.js';

// Transporte stdio: stdout é o canal do protocolo. Logs vão só para stderr, sem dados sensíveis.
const log = (msg: string): void => {
  process.stderr.write(`[mcp-postgres] ${msg}\n`);
};

// Backups e restores ficam na pasta scripts/ da raiz do projeto:
// src|dist -> postgres -> mcp -> raiz.
const SCRIPTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', 'scripts');

const server = new McpServer({ name: 'mcp-postgres-docker', version: '1.0.0' });

function ok(text: string): CallToolResult {
  return { content: [{ type: 'text', text }] };
}

function fail(err: unknown): CallToolResult {
  const message = err instanceof Error ? err.message : String(err);
  log(`erro: ${message}`);
  return { isError: true, content: [{ type: 'text', text: message }] };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

server.registerTool(
  'band_tools_backup_database',
  {
    title: 'Backup do PostgreSQL',
    description:
      `Gera um backup .sql (pg_dump, formato plain) do banco "${config.database}" no container ` +
      `"${config.container}" e salva em ${SCRIPTS_DIR}`,
    inputSchema: {},
  },
  async () => {
    try {
      const dir = await resolveOutputDir(SCRIPTS_DIR, [SCRIPTS_DIR]);
      log(`backup iniciado para ${config.database}`);
      const { filePath, size } = await backupDatabase(config, dir);
      log(`backup concluído (${formatBytes(size)})`);
      return ok(
        `Backup concluído.\nArquivo: ${filePath}\nTamanho: ${formatBytes(size)}`,
      );
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'band_tools_restore_database',
  {
    title: 'Restore do PostgreSQL',
    description:
      `Restaura um backup .sql no banco "${config.database}" do container "${config.container}". ` +
      'OPERAÇÃO DESTRUTIVA: objetos existentes são substituídos pelos do backup. ' +
      'Roda em uma transação única, então qualquer erro desfaz tudo. Exige confirm=true.',
    inputSchema: {
      backup_file: z
        .string()
        .min(1)
        .max(1024)
        .describe(`Nome do arquivo .sql de backup dentro de ${SCRIPTS_DIR}`),
      confirm: z
        .boolean()
        .describe(
          'Precisa ser true para confirmar que o banco atual será sobrescrito. Peça confirmação ao usuário antes.',
        ),
    },
    annotations: { destructiveHint: true },
  },
  async ({ backup_file, confirm }) => {
    try {
      if (confirm !== true) {
        throw new Error(
          'Restore não executado: confirme explicitamente com confirm=true.',
        );
      }
      const file = await resolveBackupFile(path.resolve(SCRIPTS_DIR, backup_file), [SCRIPTS_DIR]);
      log(`restore iniciado em ${config.database}`);
      await restoreDatabase(config, file.path);
      log('restore concluído');
      return ok(
        `Restore concluído no banco "${config.database}".\nArquivo: ${file.path} (${formatBytes(file.size)})`,
      );
    } catch (err) {
      return fail(err);
    }
  },
);

server.registerTool(
  'band_tools_drop_all_tables',
  {
    title: 'Excluir todas as tabelas',
    description:
      `Exclui TODAS as tabelas de usuário (DROP TABLE ... CASCADE, em todos os schemas) do banco "${config.database}" ` +
      `no container "${config.container}". OPERAÇÃO DESTRUTIVA: views e FKs dependentes também caem. ` +
      `Antes de excluir, gera um backup automático em ${SCRIPTS_DIR} (se o backup falhar, nada é excluído). ` +
      'Roda em uma transação única. Exige confirm_database igual ao nome do banco.',
    inputSchema: {
      confirm_database: z
        .string()
        .max(63)
        .describe(
          `Nome do banco digitado pelo usuário para confirmar ("${config.database}"). Peça ao usuário, não preencha sozinho.`,
        ),
    },
    annotations: { destructiveHint: true },
  },
  async ({ confirm_database }) => {
    try {
      if (confirm_database !== config.database) {
        throw new Error(
          `Exclusão não executada: confirm_database deve ser exatamente "${config.database}".`,
        );
      }
      // Fail secure: sem backup, sem DROP.
      const dir = await resolveOutputDir(SCRIPTS_DIR, [SCRIPTS_DIR]);
      log(`backup prévio iniciado para ${config.database}`);
      const backup = await backupDatabase(config, dir);
      log(`exclusão de tabelas iniciada em ${config.database}`);
      const count = await dropAllTables(config);
      log(`exclusão concluída (${count} tabelas)`);
      return ok(
        `${count} tabela(s) excluída(s) do banco "${config.database}".\n` +
          `Backup prévio: ${backup.filePath} (${formatBytes(backup.size)}). Use restore_database para desfazer.`,
      );
    } catch (err) {
      return fail(err);
    }
  },
);

await server.connect(new StdioServerTransport());
log(`pronto. container=${config.container} db=${config.database}`);
