import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve as resolvePath } from 'node:path';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';
import { resolve as metroResolve } from 'metro-resolver';

const projectRoot = resolvePath(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureRoot = mkdtempSync(join(tmpdir(), 'rncc-consumer-'));
const packRoot = join(fixtureRoot, 'packed');
const consumerRoot = join(fixtureRoot, 'consumer');
const consumerModules = join(consumerRoot, 'node_modules');
const npmCache = join(fixtureRoot, 'npm-cache');
mkdirSync(packRoot, { recursive: true });
mkdirSync(consumerModules, { recursive: true });

run('npm', [
  'pack',
  projectRoot,
  '--ignore-scripts',
  '--pack-destination',
  packRoot,
  '--json',
]);
const tarball = join(
  packRoot,
  readdirSync(packRoot).find((name) => name.endsWith('.tgz')),
);
run('tar', ['-xzf', tarball, '-C', packRoot]);

const packageRoot = join(consumerModules, 'rn-credit-card-textinput');
symlinkSync(join(packRoot, 'package'), packageRoot, 'dir');
symlinkSync(
  join(projectRoot, 'node_modules', '@types'),
  join(consumerModules, '@types'),
  'dir',
);
for (const peer of ['react', 'react-native']) {
  symlinkSync(
    join(projectRoot, 'node_modules', peer),
    join(consumerModules, peer),
    'dir',
  );
}

const typeFixture = join(consumerRoot, 'types.ts');
writeFileSync(
  typeFixture,
  `import type { ComponentProps } from 'react';
import { CardDateTextInput, CardNumberTextInput } from 'rn-credit-card-textinput';
const numberProps: ComponentProps<typeof CardNumberTextInput> = { updateTextVal: text => void text };
const dateProps: ComponentProps<typeof CardDateTextInput> = { updateCardDateText: text => void text };
void [numberProps, dateProps, CardNumberTextInput, CardDateTextInput];
`,
);

run(join(projectRoot, 'node_modules', '.bin', 'tsc'), [
  '--noEmit',
  '--strict',
  '--skipLibCheck',
  '--target',
  'ES2022',
  '--module',
  'ESNext',
  '--moduleResolution',
  'Bundler',
  '--jsx',
  'react',
  '--typeRoots',
  join(projectRoot, 'node_modules', '@types'),
  typeFixture,
]);

const runtimeFixture = join(consumerRoot, 'runtime.mjs');
writeFileSync(
  runtimeFixture,
  `import { CardDateTextInput, CardNumberTextInput } from 'rn-credit-card-textinput';
console.log(Boolean(CardDateTextInput && CardNumberTextInput));
`,
);
await build({
  entryPoints: [runtimeFixture],
  outfile: join(consumerRoot, 'bundle.mjs'),
  bundle: true,
  external: ['react', 'react-native'],
  format: 'esm',
  loader: { '.png': 'file' },
  logLevel: 'silent',
  mainFields: ['react-native', 'module', 'main'],
  platform: 'neutral',
  preserveSymlinks: true,
});

const packageJsonCache = new Map();
const readPackage = (path) => {
  if (!existsSync(path)) return null;
  if (!packageJsonCache.has(path)) {
    packageJsonCache.set(path, JSON.parse(readFileSync(path, 'utf8')));
  }
  return packageJsonCache.get(path);
};
const lookup = (path) => {
  if (!existsSync(path)) return { exists: false };
  const stat = statSync(path);
  return {
    exists: true,
    type: stat.isDirectory() ? 'd' : 'f',
    realPath: realpathSync(path),
  };
};
const context = {
  allowHaste: false,
  assetExts: new Set(['png']),
  customResolverOptions: {},
  disableHierarchicalLookup: false,
  doesFileExist: (path) => existsSync(path) && statSync(path).isFile(),
  extraNodeModules: null,
  dev: false,
  fileSystemLookup: lookup,
  getPackage: readPackage,
  getPackageForModule: (candidate) => {
    if (!candidate.startsWith(packageRoot)) return null;
    return {
      packageJson: readPackage(join(packageRoot, 'package.json')),
      rootPath: packageRoot,
      packageRelativePath: relative(packageRoot, candidate),
    };
  },
  mainFields: ['react-native', 'browser', 'main'],
  nodeModulesPaths: [consumerModules],
  originModulePath: runtimeFixture,
  preferNativePlatform: true,
  redirectModulePath: (path) => path,
  resolveAsset: (directory, name, extension) => {
    const exact = join(directory, `${name}${extension}`);
    return existsSync(exact) ? [exact] : null;
  },
  resolveHasteModule: () => null,
  resolveHastePackage: () => null,
  sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
  unstable_conditionNames: [],
  unstable_conditionsByPlatform: {},
  unstable_enablePackageExports: false,
  unstable_incrementalResolution: false,
  unstable_logWarning: () => undefined,
};

const metroEntry = metroResolve(context, 'rn-credit-card-textinput', 'ios');
if (
  metroEntry.type !== 'sourceFile' ||
  !metroEntry.filePath.endsWith('/dist/module/index.js')
) {
  throw new Error(
    `Unexpected Metro entry resolution: ${JSON.stringify(metroEntry)}`,
  );
}

const imageResolution = metroResolve(
  { ...context, originModulePath: metroEntry.filePath },
  './credit-card.png',
  'ios',
);
if (imageResolution.type !== 'assetFiles') {
  throw new Error(
    `Metro did not resolve the bundled image: ${JSON.stringify(imageResolution)}`,
  );
}

console.log('Verified TypeScript, bundler, and Metro package consumption.');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: consumerRoot,
    encoding: 'utf8',
    env: { ...process.env, npm_config_cache: npmCache },
  });
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}
