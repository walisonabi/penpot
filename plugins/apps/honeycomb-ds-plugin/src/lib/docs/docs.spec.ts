import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  findColorExpressions,
  indexComponentStylesByRef,
  listWidgetRefs,
  propertiesByName,
} from './index.js';
import {
  baseColorExpressionToHex,
  baseColorExpressionToRgba,
  resolveColorFromRaw,
  resolveTypography,
} from './resolve.js';
import type { HoneycombDocs } from './types.js';

const fixturePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../data/honeycomb-button-docs.json',
);

function loadFixture(): HoneycombDocs {
  return JSON.parse(readFileSync(fixturePath, 'utf8')) as HoneycombDocs;
}

describe('lib/docs', () => {
  it('indexes button componentStyle by styleDataRef', () => {
    const docs = loadFixture();
    const styles = indexComponentStylesByRef(docs);
    expect(styles.has('button')).toBe(true);
    const props = propertiesByName(styles.get('button'));
    expect(props.has('mediumHeight')).toBe(true);
    expect(props.get('mediumHeight')?.defaultValue).toBe('40');
  });

  it('lists widget refs including button', () => {
    const docs = loadFixture();
    const refs = listWidgetRefs(docs);
    expect(refs).toContain('button');
  });

  it('finds color expressions with primitiveSolidNeutral100', () => {
    const docs = loadFixture();
    const colors = findColorExpressions(docs);
    expect(colors['primitiveSolidNeutral100']).toBe('BaseColor(0xFF141414)');
    expect(colors['primitiveSolidNeutral0']).toBe('BaseColor(0xFFFFFFFF)');
  });

  it('converts BaseColor ARGB to hex and opacity', () => {
    expect(baseColorExpressionToHex('BaseColor(0xFF141414)')).toBe('#141414');
    expect(baseColorExpressionToRgba('BaseColor(0x52141414)')).toEqual({
      hex: '#141414',
      opacity: expect.closeTo(0x52 / 255, 5),
    });
    expect(baseColorExpressionToRgba('BaseColor(0x00FFFFFF)')).toEqual({
      hex: '#ffffff',
      opacity: 0,
    });
  });

  it('resolves HexaColor references through tokenData', () => {
    const docs = loadFixture();
    const colors = findColorExpressions(docs);
    const resolved = resolveColorFromRaw(
      'HexaColorProperty(color: HexaColor.primitiveSolidNeutral100)',
      colors,
    );
    expect(resolved).toEqual({
      hex: '#141414',
      opacity: 1,
      token: 'primitiveSolidNeutral100',
    });
  });

  it('parses HTextStyle typography', () => {
    const docs = loadFixture();
    const colors = findColorExpressions(docs);
    const props = propertiesByName(
      indexComponentStylesByRef(docs).get('button'),
    );
    const typography = resolveTypography(props.get('mediumTypography'), colors);
    expect(typography.fontFamilyToken).toBe('content');
    expect(typography.fontWeightToken).toBe('contentSemiboldNormal');
    expect(typography.fontSize).toBe(16);
    expect(typography.lineHeight).toBe(1.5);
  });
});
