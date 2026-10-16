import type {
  HoneycombProperty,
  ResolvedColor,
  ResolvedNumber,
  ResolvedTypography,
} from './types.js';

const HEXA_COLOR_REF = /HexaColor\.(\w+)/;
const BASE_COLOR = /BaseColor\(0x([0-9A-Fa-f]{8})\)/;

export function baseColorExpressionToRgba(
  expression: string,
): { hex: string; opacity: number } | null {
  const match = expression.match(BASE_COLOR);
  if (!match) {
    return null;
  }
  const argb = match[1];
  const opacity = Number.parseInt(argb.slice(0, 2), 16) / 255;
  const hex = `#${argb.slice(2).toLowerCase()}`;
  return { hex, opacity };
}

/** @deprecated Prefer baseColorExpressionToRgba; kept for older tests. */
export function baseColorExpressionToHex(expression: string): string | null {
  return baseColorExpressionToRgba(expression)?.hex ?? null;
}

export function extractHexaColorToken(raw: string): string | null {
  const match = raw.match(HEXA_COLOR_REF);
  return match?.[1] ?? null;
}

export function resolveColorFromRaw(
  raw: string | null | undefined,
  colorExpressions: Record<string, string>,
): ResolvedColor {
  if (!raw) {
    return { hex: '#888888', opacity: 1, token: null };
  }
  const token = extractHexaColorToken(raw);
  if (!token) {
    return { hex: '#888888', opacity: 1, token: null };
  }
  const expression = colorExpressions[token];
  if (!expression) {
    return { hex: '#888888', opacity: 1, token };
  }
  const rgba = baseColorExpressionToRgba(expression);
  if (!rgba) {
    return { hex: '#888888', opacity: 1, token };
  }
  return { hex: rgba.hex, opacity: rgba.opacity, token };
}

export function numberFromProperty(
  prop: HoneycombProperty | undefined,
): ResolvedNumber {
  if (!prop) {
    return { value: 0, token: null };
  }
  if (typeof prop.tokenValue === 'number') {
    return {
      value: prop.tokenValue,
      token: typeof prop.defaultValue === 'string' ? prop.defaultValue : null,
    };
  }
  if (prop.defaultValue != null && prop.defaultValue !== '') {
    const parsed = Number(prop.defaultValue);
    if (!Number.isNaN(parsed)) {
      return { value: parsed, token: null };
    }
  }
  return { value: 0, token: null };
}

export function resolveTypography(
  prop: HoneycombProperty | undefined,
  colorExpressions: Record<string, string>,
): ResolvedTypography {
  const raw =
    typeof prop?.tokenValue === 'string'
      ? prop.tokenValue
      : typeof prop?.defaultValue === 'string'
        ? prop.defaultValue
        : '';
  const color = resolveColorFromRaw(raw, colorExpressions);
  const fontFamily = raw.match(/fontFamily:\s*HexaFontFamily\.(\w+)/)?.[1] ?? null;
  const fontWeight = raw.match(/fontWeight:\s*HexaFontWeight\.(\w+)/)?.[1] ?? null;
  const fontSizeMatch = raw.match(/rawFontSize:\s*([\d.]+)/);
  const lineHeightMatch = raw.match(/rawHeight:\s*([\d.]+)/);
  return {
    fontFamilyToken: fontFamily,
    fontWeightToken: fontWeight,
    fontSize: fontSizeMatch ? Number(fontSizeMatch[1]) : 16,
    lineHeight: lineHeightMatch ? Number(lineHeightMatch[1]) : 1.2,
    color,
  };
}

export function fontWeightToCss(token: string | null): string {
  if (!token) {
    return '600';
  }
  if (/semibold/i.test(token) || /semiBold/i.test(token)) {
    return '600';
  }
  if (/bold/i.test(token)) {
    return '700';
  }
  if (/medium/i.test(token)) {
    return '500';
  }
  if (/regular|normal/i.test(token)) {
    return '400';
  }
  return '600';
}
