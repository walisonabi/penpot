import type { ButtonPrimarySpec } from '../lib/honeycomb-docs.js';

export type PluginUIEvent =
  | { type: 'create-button' }
  | { type: 'theme'; content: string };

export type ImportResult =
  | {
      ok: true;
      componentName: string;
      spec: ButtonPrimarySpec;
      dtcg: Record<string, unknown>;
    }
  | { ok: false; hint: string };

export type PluginMessageEvent =
  | { type: 'theme'; content: string }
  | { type: 'import-result'; content: ImportResult };
