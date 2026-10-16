import { importBundle } from './builders/registry.js';
import { log, setProgress } from './builders/log.js';
import { runSmokeLadder } from './builders/smoke.js';
import type { ComponentsBundle } from './lib/specs/types.js';
import componentsBundle from './generated/components.json';

const bundle = componentsBundle as ComponentsBundle;

type UiMessage =
  | { type: 'ready' }
  | { type: 'import' }
  | { type: 'smoke' };

penpot.ui.open(
  'Honeycomb Design System',
  `assets/panel.html?theme=${penpot.theme}`,
  { width: 380, height: 360 },
);

penpot.on('themechange', (theme) => {
  penpot.ui.sendMessage({ type: 'theme', content: theme });
});

setProgress((step) => {
  penpot.ui.sendMessage({ type: 'progress', content: step });
});

penpot.ui.onMessage<UiMessage>((message) => {
  if (message.type === 'ready') {
    log('Painel pronto. Aguardando ação.');
    penpot.ui.sendMessage({
      type: 'plugin-ready',
      coverage: bundle.coverage,
      components: bundle.components.map((c) => ({
        styleDataRef: c.styleDataRef,
        name: c.name,
        variants: c.variants.length,
      })),
    });
    return;
  }
  if (message.type === 'smoke') {
    runAndNotify(() => {
      const failure = runSmokeLadder();
      if (failure) {
        throw new Error(failure);
      }
      return { ok: true as const, message: 'Smoke ladder OK.' };
    });
    return;
  }
  if (message.type === 'import') {
    runAndNotify(() => {
      const result = importBundle(bundle);
      if (result.built.length === 0) {
        throw new Error('Nenhum componente com builder no bundle.');
      }
      const summary = result.built
        .map((b) => `${b.name} (${b.variantCount} variants)`)
        .join(', ');
      return {
        ok: true as const,
        message: `Importado: ${summary}`,
        warnings: result.warnings,
      };
    });
  }
});

function runAndNotify(work: () => { ok: true; message: string; warnings?: string[] }) {
  try {
    const result = work();
    penpot.ui.sendMessage({
      type: 'import-result',
      content: {
        ok: true,
        message: result.message,
        warnings: result.warnings ?? [],
      },
    });
  } catch (error) {
    const hint = error instanceof Error ? error.message : String(error);
    console.error('[honeycomb-ds]', hint, error);
    penpot.ui.sendMessage({
      type: 'import-result',
      content: { ok: false, hint },
    });
  }
}
