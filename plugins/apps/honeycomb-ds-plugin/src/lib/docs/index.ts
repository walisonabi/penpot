import type {
  ComponentStyleEntry,
  HoneycombDocs,
  HoneycombProperty,
  WidgetEntry,
} from './types.js';

export function indexComponentStylesByRef(
  docs: HoneycombDocs,
): Map<string, ComponentStyleEntry> {
  const map = new Map<string, ComponentStyleEntry>();
  for (const entry of docs.componentStyle ?? []) {
    const ref = entry.object?.styleDataRef;
    if (ref) {
      map.set(ref, entry);
    }
  }
  return map;
}

export function indexWidgetsByParserName(
  docs: HoneycombDocs,
): Map<string, WidgetEntry> {
  const map = new Map<string, WidgetEntry>();
  for (const entry of docs.widget ?? []) {
    const name = entry.object?.parserName ?? entry.object?.type;
    if (name) {
      map.set(name, entry);
    }
  }
  return map;
}

export function listWidgetRefs(docs: HoneycombDocs): string[] {
  const refs = new Set<string>();
  for (const entry of docs.widget ?? []) {
    if (entry.object?.parserName) {
      refs.add(entry.object.parserName);
    }
  }
  for (const entry of docs.componentStyle ?? []) {
    if (entry.object?.styleDataRef) {
      refs.add(entry.object.styleDataRef);
    }
  }
  return [...refs].sort();
}

export function propertiesByName(
  entry: ComponentStyleEntry | undefined,
): Map<string, HoneycombProperty> {
  const props = entry?.object?.properties ?? [];
  return new Map(props.map((prop) => [prop.name, prop]));
}

export function findColorExpressions(
  docs: HoneycombDocs,
): Record<string, string> {
  for (const entry of docs.tokenData ?? []) {
    const expressions = entry.object?.defaultTokenValueExpressions;
    if (expressions && 'primitiveSolidNeutral100' in expressions) {
      return expressions;
    }
  }
  for (const entry of docs.tokenData ?? []) {
    const expressions = entry.object?.defaultTokenValueExpressions;
    if (expressions && Object.keys(expressions).length > 0) {
      return expressions;
    }
  }
  return {};
}
