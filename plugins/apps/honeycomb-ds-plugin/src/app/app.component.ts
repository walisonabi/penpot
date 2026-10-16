import { Component, signal } from '@angular/core';
import type { ImportResult, PluginMessageEvent, PluginUIEvent } from './model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  host: {
    '[attr.data-theme]': 'theme()',
  },
})
export class AppComponent {
  readonly theme = signal(
    new URLSearchParams(window.location.search).get('theme') ?? 'light',
  );
  readonly status = signal<string>(
    'Spec embutido no plugin. Clique para criar o componente.',
  );
  readonly busy = signal(false);

  constructor() {
    window.addEventListener('message', (event: MessageEvent<PluginMessageEvent>) => {
      const data = event.data;
      if (!data || typeof data !== 'object' || !('type' in data)) {
        return;
      }
      if (data.type === 'theme') {
        this.theme.set(data.content);
      } else if (data.type === 'import-result') {
        this.handleImportResult(data.content);
      }
    });
  }

  createButton() {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    this.status.set('Criando no Penpot…');
    this.sendToPlugin({ type: 'create-button' });
  }

  private sendToPlugin(message: PluginUIEvent) {
    parent.postMessage(message, '*');
  }

  private handleImportResult(result: ImportResult) {
    this.busy.set(false);
    if (!result.ok) {
      this.status.set(`Erro: ${result.hint}`);
      return;
    }
    this.status.set(
      `Pronto: "${result.componentName}" na biblioteca local e no canvas.`,
    );
  }
}
