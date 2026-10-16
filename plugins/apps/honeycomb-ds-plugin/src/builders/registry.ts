import type { ComponentSetSpec, ComponentsBundle } from '../lib/specs/types.js';
import { buildButtonComponentSet } from './button.js';
import { log } from './log.js';

export type BuildResult = {
  name: string;
  variantCount: number;
  warnings: string[];
};

type Builder = (spec: ComponentSetSpec) => BuildResult;

const builders: Record<string, Builder> = {
  button: buildButtonComponentSet,
};

export function registeredBuilders(): string[] {
  return Object.keys(builders);
}

export function importBundle(bundle: ComponentsBundle): {
  built: BuildResult[];
  skipped: string[];
  warnings: string[];
} {
  const built: BuildResult[] = [];
  const skipped: string[] = [];
  const warnings: string[] = [...(bundle.coverage.withoutBuilder ?? [])].map(
    (ref) => `Sem builder: ${ref}`,
  );

  for (const component of bundle.components) {
    const builder = builders[component.styleDataRef];
    if (!builder) {
      skipped.push(component.styleDataRef);
      log(`Pulando ${component.styleDataRef}: sem builder registrado.`);
      continue;
    }
    built.push(builder(component));
  }

  for (const result of built) {
    warnings.push(...result.warnings);
  }

  return { built, skipped, warnings };
}
