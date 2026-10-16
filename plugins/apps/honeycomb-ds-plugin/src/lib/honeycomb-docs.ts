export type HoneycombProperty = {
  name: string;
  defaultValue?: string;
  tokenValue?: number | string;
  type?: string;
  parent?: string;
};

export type HoneycombDocs = {
  componentStyle?: Array<{
    object?: {
      styleDataRef?: string;
      properties?: HoneycombProperty[];
    };
  }>;
  tokenData?: Array<{
    object?: {
      tokenAccessProperty?: string;
      defaultTokenValues?: Record<string, number>;
      defaultTokenValueExpressions?: Record<string, string>;
    };
  }>;
};

export type ButtonPrimarySpec = {
  height: number;
  horizontalPadding: number;
  borderRadius: number;
  fontSize: number;
  backgroundHex: string;
  textHex: string;
  minWidth: number;
};

const BUTTON_PROP_NAMES = {
  height: 'mediumHeight',
  horizontalPadding: 'mediumHorizontalSpacing',
  borderRadius: 'mediumBorderRadius',
  minWidth: 'mediumContainedWidth',
  background: 'bgButtonPrimaryDefault',
  text: 'txtButtonPrimaryDefault',
  typography: 'mediumTypography',
} as const;

export function findColorExpressions(
  docs: HoneycombDocs,
): Record<string, string> {
  for (const entry of docs.tokenData ?? []) {
    const expressions = entry.object?.defaultTokenValueExpressions;
    if (!expressions) {
      continue;
    }
    if ('primitiveSolidNeutral100' in expressions) {
      return expressions;
    }
  }
  return {};
}

const HEXA_COLOR_REF = /HexaColor\.(\w+)/g;

export function collectHexaColorKeysFromProperties(
  properties: HoneycombProperty[],
): Set<string> {
  const keys = new Set<string>();
  for (const prop of properties) {
    for (const raw of [prop.defaultValue, prop.tokenValue]) {
      if (typeof raw !== 'string') {
        continue;
      }
      for (const match of raw.matchAll(HEXA_COLOR_REF)) {
        keys.add(match[1]);
      }
    }
  }
  keys.add('primitiveSolidNeutral100');
  keys.add('primitiveSolidNeutral0');
  return keys;
}

export function slimColorExpressions(
  expressions: Record<string, string>,
  colorKeys: Set<string>,
): Record<string, string> {
  const slim: Record<string, string> = {};
  for (const key of colorKeys) {
    const value = expressions[key];
    if (value) {
      slim[key] = value;
    }
  }
  return slim;
}

/**
 * Reduces a full generated_docs payload (~100k+ lines) to what the Button PoC needs,
 * so JSON.parse + postMessage stay fast enough in the plugin UI.
 */
export function slimHoneycombDocsForButtonImport(
  docs: HoneycombDocs,
): HoneycombDocs {
  const componentStyle = (docs.componentStyle ?? []).filter(
    (entry) => entry.object?.styleDataRef === 'button',
  );
  const buttonProps = componentStyle[0]?.object?.properties ?? [];
  const colorKeys = collectHexaColorKeysFromProperties(buttonProps);

  let tokenData: HoneycombDocs['tokenData'] = [];
  for (const entry of docs.tokenData ?? []) {
    const full = entry.object?.defaultTokenValueExpressions;
    if (!full || !('primitiveSolidNeutral100' in full)) {
      continue;
    }
    tokenData = [
      {
        object: {
          defaultTokenValueExpressions: slimColorExpressions(full, colorKeys),
        },
      },
    ];
    break;
  }

  return { componentStyle, tokenData };
}

export function findButtonProperties(
  docs: HoneycombDocs,
): Map<string, HoneycombProperty> {
  const button = docs.componentStyle?.find(
    (entry) => entry.object?.styleDataRef === 'button',
  );
  const properties = button?.object?.properties ?? [];
  return new Map(properties.map((prop) => [prop.name, prop]));
}

export function baseColorExpressionToHex(expression: string): string | null {
  const match = expression.match(/BaseColor\(0x([0-9A-Fa-f]{8})\)/);
  if (!match) {
    return null;
  }
  const argb = match[1];
  return `#${argb.slice(2).toLowerCase()}`;
}

export function resolveHexaColorReference(
  value: string,
  colorExpressions: Record<string, string>,
): string {
  const tokenMatch = value.match(/HexaColor\.(\w+)/);
  if (!tokenMatch) {
    return '#888888';
  }
  const key = tokenMatch[1];
  const expression = colorExpressions[key];
  if (!expression) {
    return '#888888';
  }
  return baseColorExpressionToHex(expression) ?? '#888888';
}

function numberFromProperty(prop?: HoneycombProperty): number | undefined {
  if (!prop) {
    return undefined;
  }
  if (typeof prop.tokenValue === 'number') {
    return prop.tokenValue;
  }
  if (prop.defaultValue != null && prop.defaultValue !== '') {
    const parsed = Number(prop.defaultValue);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
}

function fontSizeFromTypography(prop?: HoneycombProperty): number {
  const raw = prop?.tokenValue ?? prop?.defaultValue;
  if (typeof raw !== 'string') {
    return 16;
  }
  const match = raw.match(/rawFontSize:\s*(\d+)/);
  return match ? Number(match[1]) : 16;
}

export function buildButtonPrimarySpec(
  docs: HoneycombDocs,
): ButtonPrimarySpec {
  const props = findButtonProperties(docs);
  const colors = findColorExpressions(docs);

  const height =
    numberFromProperty(props.get(BUTTON_PROP_NAMES.height)) ?? 40;
  const horizontalPadding =
    numberFromProperty(props.get(BUTTON_PROP_NAMES.horizontalPadding)) ?? 16;
  const borderRadius =
    numberFromProperty(props.get(BUTTON_PROP_NAMES.borderRadius)) ?? 9999;
  const minWidth =
    numberFromProperty(props.get(BUTTON_PROP_NAMES.minWidth)) ?? 129;

  const backgroundHex = resolveHexaColorReference(
    props.get(BUTTON_PROP_NAMES.background)?.defaultValue ?? '',
    colors,
  );
  const textHex = resolveHexaColorReference(
    props.get(BUTTON_PROP_NAMES.text)?.defaultValue ?? '',
    colors,
  );
  const fontSize = fontSizeFromTypography(
    props.get(BUTTON_PROP_NAMES.typography),
  );

  return {
    height,
    horizontalPadding,
    borderRadius,
    fontSize,
    backgroundHex,
    textHex,
    minWidth,
  };
}
