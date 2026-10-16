import { describe, expect, it } from 'vitest';
import {
  baseColorExpressionToHex,
  buildButtonPrimarySpec,
  slimHoneycombDocsForButtonImport,
  type HoneycombDocs,
} from './honeycomb-docs.js';

describe('honeycomb-docs', () => {
  it('converts BaseColor expressions to hex', () => {
    expect(baseColorExpressionToHex('BaseColor(0xFF141414)')).toBe('#141414');
  });

  it('builds primary button spec from minimal docs slice', () => {
    const docs: HoneycombDocs = {
      tokenData: [
        {
          object: {
            defaultTokenValueExpressions: {
              primitiveSolidNeutral100: 'BaseColor(0xFF141414)',
              primitiveSolidNeutral0: 'BaseColor(0xFFFFFFFF)',
            },
          },
        },
      ],
      componentStyle: [
        {
          object: {
            styleDataRef: 'button',
            properties: [
              { name: 'mediumHeight', defaultValue: '40' },
              {
                name: 'mediumHorizontalSpacing',
                defaultValue: 'medium',
                tokenValue: 16,
              },
              {
                name: 'mediumBorderRadius',
                defaultValue: 'borderRadiusFull',
                tokenValue: 9999,
              },
              { name: 'mediumContainedWidth', defaultValue: '129' },
              {
                name: 'bgButtonPrimaryDefault',
                defaultValue:
                  'HexaColorProperty(color: HexaColor.primitiveSolidNeutral100)',
              },
              {
                name: 'txtButtonPrimaryDefault',
                defaultValue:
                  'HexaColorProperty(color: HexaColor.primitiveSolidNeutral0)',
              },
              {
                name: 'mediumTypography',
                tokenValue:
                  'HTextStyle(rawFontSize: 16, color: HexaColorProperty(color: HexaColor.foundationTxtDefault))',
              },
            ],
          },
        },
      ],
    };

    const spec = buildButtonPrimarySpec(docs);
    expect(spec.height).toBe(40);
    expect(spec.backgroundHex).toBe('#141414');
    expect(spec.textHex).toBe('#ffffff');
    expect(spec.horizontalPadding).toBe(16);
  });

  it('slims large docs to button slice and minimal colors', () => {
    const docs: HoneycombDocs = {
      componentStyle: [
        { object: { styleDataRef: 'dialog', properties: [] } },
        {
          object: {
            styleDataRef: 'button',
            properties: [
              {
                name: 'bgButtonPrimaryDefault',
                defaultValue:
                  'HexaColorProperty(color: HexaColor.primitiveSolidNeutral100)',
              },
            ],
          },
        },
      ],
      tokenData: [
        {
          object: {
            defaultTokenValueExpressions: {
              primitiveSolidNeutral100: 'BaseColor(0xFF141414)',
              primitiveSolidNeutral0: 'BaseColor(0xFFFFFFFF)',
              unusedColor: 'BaseColor(0xFF000000)',
            },
          },
        },
      ],
    };

    const slim = slimHoneycombDocsForButtonImport(docs);
    expect(slim.componentStyle).toHaveLength(1);
    expect(slim.tokenData?.[0]?.object?.defaultTokenValueExpressions).toEqual({
      primitiveSolidNeutral100: 'BaseColor(0xFF141414)',
      primitiveSolidNeutral0: 'BaseColor(0xFFFFFFFF)',
    });
    expect(
      slim.tokenData?.[0]?.object?.defaultTokenValueExpressions?.[
        'unusedColor'
      ],
    ).toBeUndefined();
  });
});
