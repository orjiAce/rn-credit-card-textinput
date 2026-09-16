import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const npmCache = mkdtempSync(join(tmpdir(), 'rncc-npm-cache-'));

const result = spawnSync(
  'npm',
  ['pack', '--dry-run', '--ignore-scripts', '--json'],
  {
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: npmCache },
  },
);

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status ?? 1);
}

const [pack] = JSON.parse(result.stdout);
const files = new Set(pack.files.map(({ path }) => path));
const required = [
  'README.md',
  'package.json',
  'src/index.ts',
  'src/credit-card.png',
  'dist/module/index.js',
  'dist/module/credit-card.png',
  'dist/typescript/index.d.ts',
];

for (const path of required) {
  if (!files.has(path)) throw new Error(`Packed package is missing ${path}`);
}

for (const path of files) {
  if (path.startsWith('tests/') || path.startsWith('node_modules/')) {
    throw new Error(`Development-only path was packed: ${path}`);
  }
}

console.log(
  `Verified ${pack.files.length} packed files (${pack.size} bytes packed).`,
);
