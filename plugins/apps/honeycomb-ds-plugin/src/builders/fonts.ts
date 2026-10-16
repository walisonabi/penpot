import {
  FALLBACK_FONT_FAMILY,
  resolvePenpotFontFamily,
} from '../lib/fonts/map.js';
import { log } from './log.js';

const missing = new Set<string>();

export function applyFontFamily(
  text: { fontId: string; fontFamily: string },
  familyToken: string | null,
  resolvedFamily: string,
): void {
  const family = resolvedFamily || resolvePenpotFontFamily(familyToken);
  const font = penpot.fonts.findByName(family);
  if (font) {
    text.fontId = font.fontId;
    text.fontFamily = font.fontFamily;
    return;
  }
  if (!missing.has(family)) {
    missing.add(family);
    log(
      `Fonte "${family}" não encontrada no Penpot. Usando fallback "${FALLBACK_FONT_FAMILY}". Instale DMTaDa/NTTaDa (hexa/fonts) e reabra o plugin.`,
    );
  }
  const fallback = penpot.fonts.findByName(FALLBACK_FONT_FAMILY);
  if (fallback) {
    text.fontId = fallback.fontId;
    text.fontFamily = fallback.fontFamily;
  }
}

export function fontWarnings(): string[] {
  return [...missing].map(
    (family) => `Fonte ausente: ${family} (fallback ${FALLBACK_FONT_FAMILY})`,
  );
}
