import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listWidgetRefs } from '../src/lib/docs/index.ts';
import type { HoneycombDocs } from '../src/lib/docs/types.ts';
import { extractButtonComponentSet } from '../src/lib/specs/button.ts';
import type { ComponentsBundle } from '../src/lib/specs/types.ts';

/** Prefer cwd when bundled (esbuild); fall back to script directory. */
function resolvePkgRoot(): string {
  const fromCwd = resolve(process.cwd());
  if (existsSync(resolve(fromCwd, 'package.json'))) {
    return fromCwd;
  }
  return resolve(dirname(fileURLToPath(import.meta.url)), '..');
}

const pkgRoot = resolvePkgRoot();

const BUILDERS = new Set(['button']);

function resolveInputPath(): string {
  if (process.argv[2]) {
    return resolve(process.argv[2]);
  }
  if (process.env.HONEYCOMB_DOCS) {
    return resolve(process.env.HONEYCOMB_DOCS);
  }
  const full = resolve(pkgRoot, 'data/generated_docs.json');
  if (existsSync(full)) {
    return full;
  }
  return resolve(pkgRoot, 'data/honeycomb-button-docs.json');
}

const inputPath = resolveInputPath();
const outputPath = resolve(pkgRoot, 'src/generated/components.json');

const docs = JSON.parse(readFileSync(inputPath, 'utf8')) as HoneycombDocs;
const widgetsInDocs = listWidgetRefs(docs);
const withBuilder = widgetsInDocs.filter((ref) => BUILDERS.has(ref));
const withoutBuilder = widgetsInDocs.filter((ref) => !BUILDERS.has(ref));

const components = [];
if (widgetsInDocs.includes('button') || BUILDERS.has('button')) {
  components.push(extractButtonComponentSet(docs));
}

const bundle: ComponentsBundle = {
  version: 1,
  components,
  coverage: {
    widgetsInDocs,
    withBuilder,
    withoutBuilder,
  },
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(bundle, null, 2)}\n`);

console.log(`Input:  ${inputPath}`);
console.log(`Output: ${outputPath}`);
console.log(`Components: ${components.map((c) => c.styleDataRef).join(', ')}`);
console.log(
  `Coverage: ${withBuilder.length}/${widgetsInDocs.length} widgets with builder`,
);
if (withoutBuilder.length) {
  console.log(
    `Skipped (no builder yet): ${withoutBuilder.slice(0, 20).join(', ')}${
      withoutBuilder.length > 20 ? '…' : ''
    }`,
  );
}
