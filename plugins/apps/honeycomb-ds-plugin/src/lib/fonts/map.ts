/**
 * Abstract Hexa font token → family name installed in Penpot.
 * Install DMTaDa / NTTaDa from sting-honeycomb-flutter/dsms/hexa/fonts before import.
 */
export const HEXA_FONT_FAMILY_MAP: Record<string, string> = {
  content: 'DMTaDa',
  main: 'DMTaDa',
  display: 'NTTaDa',
  heading: 'Barlow',
  paragraph: 'WorkSans',
};

export const FALLBACK_FONT_FAMILY = 'sourcesanspro';

export function resolvePenpotFontFamily(token: string | null): string {
  if (!token) {
    return FALLBACK_FONT_FAMILY;
  }
  return HEXA_FONT_FAMILY_MAP[token] ?? FALLBACK_FONT_FAMILY;
}
