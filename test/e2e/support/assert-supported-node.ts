/**
 * Testcontainers (and its undici dependency) crash at require-time on older Node versions
 * with an obscure "webidl.util.markAsUncloneable is not a function". This module must be the
 * first import of global-setup.ts so the check runs before Testcontainers is loaded.
 */
const MINIMUM_NODE = [22, 22];

const [major, minor] = process.versions.node.split('.').map(Number);
const isSupported =
  major > MINIMUM_NODE[0] ||
  (major === MINIMUM_NODE[0] && minor >= MINIMUM_NODE[1]);

if (!isSupported) {
  throw new Error(
    `e2e tests require Node >= ${MINIMUM_NODE.join('.')} (current: v${process.versions.node}). ` +
      'Run `nvm install && nvm use` in the project root (version pinned in .nvmrc).',
  );
}
