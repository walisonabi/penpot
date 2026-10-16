import { log } from './log.js';

export const PLUGIN_SOURCE_KEY = 'honeycomb:source';

type RemovableComponent = {
  getPluginData(key: string): string;
  remove?: () => void;
  mainInstance?: () => { remove?: () => void; parent?: { remove?: () => void } | null };
};

/**
 * Removes component sets previously created by this plugin for the given source.
 */
export function removePreviousImports(source: string) {
  const components = penpot.library.local.components as unknown as RemovableComponent[];
  const marked = components.filter(
    (comp) => comp.getPluginData(PLUGIN_SOURCE_KEY) === source,
  );
  if (marked.length === 0) {
    log(`Nenhum import anterior de "${source}" para remover.`);
    return;
  }
  log(`Removendo ${marked.length} componente(s) marcado(s) como ${source}…`);
  for (const comp of marked) {
    try {
      if (typeof comp.remove === 'function') {
        comp.remove();
        continue;
      }
      const main = comp.mainInstance?.();
      main?.parent?.remove?.();
      main?.remove?.();
    } catch (error) {
      console.warn('[honeycomb-ds] falha ao remover componente:', error);
    }
  }
}

export function markComponentSource(
  component: { setPluginData(key: string, value: string): void },
  source: string,
) {
  component.setPluginData(PLUGIN_SOURCE_KEY, source);
}
