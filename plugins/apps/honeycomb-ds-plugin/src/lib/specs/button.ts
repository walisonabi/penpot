import {
  findColorExpressions,
  indexComponentStylesByRef,
  propertiesByName,
} from '../docs/index.js';
import {
  fontWeightToCss,
  numberFromProperty,
  resolveColorFromRaw,
  resolveTypography,
} from '../docs/resolve.js';
import type { HoneycombDocs, HoneycombProperty } from '../docs/types.js';
import { resolvePenpotFontFamily } from '../fonts/map.js';
import type {
  ButtonVariantAxes,
  ButtonVariantSpec,
  ComponentSetSpec,
} from './types.js';

/** Stroke width is not in generated_docs; match Flutter button default. */
export const BUTTON_STROKE_WIDTH_PX = 1;

const VARIANTS = [
  'primary',
  'secondary',
  'tertiary',
  'destructive',
] as const;
const SIZES = ['small', 'medium', 'large'] as const;
const STATES = ['default', 'pressed', 'disabled'] as const;

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function bgPropName(variant: string, state: string): string {
  return `bgButton${capitalize(variant)}${capitalize(state)}`;
}

function txtPropName(variant: string, state: string): string {
  return `txtButton${capitalize(variant)}${capitalize(state)}`;
}

function borderPropName(variant: string, state: string): string {
  if (state === 'default') {
    return `borderButton${capitalize(variant)}`;
  }
  return `borderButton${capitalize(variant)}${capitalize(state)}`;
}

function rawOf(prop: HoneycombProperty | undefined): string {
  if (typeof prop?.defaultValue === 'string') {
    return prop.defaultValue;
  }
  if (typeof prop?.tokenValue === 'string') {
    return prop.tokenValue;
  }
  return '';
}

export function extractButtonComponentSet(
  docs: HoneycombDocs,
): ComponentSetSpec {
  const styles = indexComponentStylesByRef(docs);
  const button = styles.get('button');
  if (!button) {
    throw new Error('generated_docs sem componentStyle styleDataRef "button".');
  }
  const props = propertiesByName(button);
  const colors = findColorExpressions(docs);
  const variants: ButtonVariantSpec[] = [];

  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      for (const state of STATES) {
        const axes: ButtonVariantAxes = { variant, size, state };
        const height = numberFromProperty(props.get(`${size}Height`));
        const minWidth = numberFromProperty(
          props.get(`${size}ContainedWidth`),
        );
        const horizontalPadding = numberFromProperty(
          props.get(`${size}HorizontalSpacing`),
        );
        const borderRadius = numberFromProperty(
          props.get(`${size}BorderRadius`),
        );
        const typography = resolveTypography(
          props.get(`${size}Typography`),
          colors,
        );
        const background = resolveColorFromRaw(
          rawOf(props.get(bgPropName(variant, state))),
          colors,
        );
        // Label color comes from state-specific txt* props (not typography default).
        const labelColor = resolveColorFromRaw(
          rawOf(props.get(txtPropName(variant, state))),
          colors,
        );
        const border = resolveColorFromRaw(
          rawOf(props.get(borderPropName(variant, state))),
          colors,
        );

        variants.push({
          props: axes,
          layout: {
            height,
            minWidth,
            horizontalPadding,
            borderRadius,
          },
          fills: { background },
          strokes: {
            border: { ...border, width: BUTTON_STROKE_WIDTH_PX },
          },
          label: {
            text: 'Button',
            fontSize: { value: typography.fontSize, token: null },
            fontWeight: {
              value: fontWeightToCss(typography.fontWeightToken),
              token: typography.fontWeightToken,
            },
            fontFamily: {
              value: resolvePenpotFontFamily(typography.fontFamilyToken),
              token: typography.fontFamilyToken,
            },
            lineHeight: { value: typography.lineHeight, token: null },
            color: labelColor,
          },
        });
      }
    }
  }

  if (variants.length !== 36) {
    throw new Error(`Expected 36 button variants, got ${variants.length}`);
  }

  return {
    styleDataRef: 'button',
    kind: 'componentSet',
    name: 'HexaButton',
    axes: ['variant', 'size', 'state'],
    variants,
  };
}

export function variantComponentName(axes: ButtonVariantAxes): string {
  return `variant=${axes.variant}, size=${axes.size}, state=${axes.state}`;
}
