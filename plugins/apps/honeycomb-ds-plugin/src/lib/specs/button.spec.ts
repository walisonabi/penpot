import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { HoneycombDocs } from '../docs/types.js';
import { extractButtonComponentSet, variantComponentName } from './button.js';

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../data/honeycomb-button-docs.json',
);

function loadFixture(): HoneycombDocs {
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as HoneycombDocs;
}

describe('extractButtonComponentSet', () => {
  it('builds 36 variants (variant x size x state)', () => {
    const set = extractButtonComponentSet(loadFixture());
    expect(set.styleDataRef).toBe('button');
    expect(set.name).toBe('HexaButton');
    expect(set.variants).toHaveLength(36);
  });

  it('resolves primary/medium/default from fixture values', () => {
    const set = extractButtonComponentSet(loadFixture());
    const variant = set.variants.find(
      (v) =>
        v.props.variant === 'primary' &&
        v.props.size === 'medium' &&
        v.props.state === 'default',
    );
    expect(variant).toBeDefined();
    expect(variant!.layout.height.value).toBe(40);
    expect(variant!.layout.minWidth.value).toBe(129);
    expect(variant!.layout.horizontalPadding.value).toBe(16);
    expect(variant!.layout.borderRadius.value).toBe(9999);
    expect(variant!.fills.background.hex).toBe('#141414');
    expect(variant!.fills.background.token).toBe('primitiveSolidNeutral100');
    expect(variant!.label.color.hex).toBe('#ffffff');
    expect(variant!.label.color.token).toBe('primitiveSolidNeutral0');
    expect(variant!.label.fontSize.value).toBe(16);
    expect(variant!.label.fontFamily.value).toBe('DMTaDa');
    expect(variant!.label.fontFamily.token).toBe('content');
  });

  it('covers size heights and widths', () => {
    const set = extractButtonComponentSet(loadFixture());
    const bySize = (size: 'small' | 'medium' | 'large') =>
      set.variants.find(
        (v) =>
          v.props.size === size &&
          v.props.variant === 'primary' &&
          v.props.state === 'default',
      )!;
    expect(bySize('small').layout.height.value).toBe(32);
    expect(bySize('small').layout.minWidth.value).toBe(117);
    expect(bySize('medium').layout.height.value).toBe(40);
    expect(bySize('medium').layout.minWidth.value).toBe(129);
    expect(bySize('large').layout.height.value).toBe(48);
    expect(bySize('large').layout.minWidth.value).toBe(157);
  });

  it('formats Penpot variant component names', () => {
    expect(
      variantComponentName({
        variant: 'primary',
        size: 'large',
        state: 'disabled',
      }),
    ).toBe('variant=primary, size=large, state=disabled');
  });
});
