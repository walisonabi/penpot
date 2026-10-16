import type { Board } from '@penpot/plugin-types';
import { variantComponentName } from '../lib/specs/button.js';
import type {
  ButtonVariantSpec,
  ComponentSetSpec,
} from '../lib/specs/types.js';
import { applyFontFamily, fontWarnings } from './fonts.js';
import { log } from './log.js';
import { markComponentSource, removePreviousImports } from './replace.js';

const SOURCE = 'button';

export function buildButtonComponentSet(spec: ComponentSetSpec): {
  name: string;
  variantCount: number;
  warnings: string[];
} {
  if (!penpot.currentPage?.root) {
    throw new Error('Abra um arquivo Penpot com uma página ativa.');
  }

  removePreviousImports(SOURCE);

  log(`Criando ${spec.variants.length} variants de ${spec.name}…`);
  const mains: ReturnType<typeof createVariantBoard>['main'][] = [];
  const createdIds = new Set<string>();

  for (const variant of spec.variants) {
    const created = createVariantBoard(variant);
    mains.push(created.main);
    createdIds.add(created.componentId);
  }

  log('Combinando em component set (createVariantFromComponents)…');
  const container = penpot.createVariantFromComponents(mains);
  if (!container) {
    throw new Error('createVariantFromComponents retornou vazio.');
  }
  container.name = spec.name;
  container.setPluginData('honeycomb:source', SOURCE);

  for (const component of penpot.library.local.components) {
    if (createdIds.has(component.id)) {
      markComponentSource(component, SOURCE);
    }
  }

  // Place one instance of the first variant near viewport center.
  const first = penpot.library.local.components.find((c) =>
    createdIds.has(c.id),
  );
  if (first) {
    const instance = first.instance();
    const { center } = penpot.viewport;
    instance.x = center.x - 80;
    instance.y = center.y - 20;
    const root = penpot.currentPage.root as Board;
    root.appendChild(instance);
  }

  const warnings = fontWarnings();
  log(`Pronto: ${spec.name} com ${spec.variants.length} variants.`);
  return {
    name: spec.name,
    variantCount: spec.variants.length,
    warnings,
  };
}

function createVariantBoard(variant: ButtonVariantSpec): {
  main: Board;
  componentId: string;
} {
  const { layout, fills, strokes, label, props } = variant;
  const name = variantComponentName(props);

  const board = penpot.createBoard();
  if (!board) {
    throw new Error(`createBoard falhou para ${name}`);
  }
  board.name = name;
  board.resize(layout.minWidth.value, layout.height.value);
  board.borderRadius = Math.min(
    layout.borderRadius.value,
    layout.height.value / 2,
  );
  board.fills = [
    {
      fillColor: fills.background.hex,
      fillOpacity: fills.background.opacity,
    },
  ];
  if (strokes.border.opacity > 0.001) {
    board.strokes = [
      {
        strokeColor: strokes.border.hex,
        strokeOpacity: strokes.border.opacity,
        strokeWidth: strokes.border.width,
        strokeStyle: 'solid',
        strokeAlignment: 'inner',
      },
    ];
  } else {
    board.strokes = [];
  }

  const flex = board.addFlexLayout();
  flex.dir = 'row';
  flex.alignItems = 'center';
  flex.justifyContent = 'center';
  flex.horizontalPadding = layout.horizontalPadding.value;
  flex.verticalPadding = 0;
  flex.horizontalSizing = 'fix';
  flex.verticalSizing = 'fix';

  const text = penpot.createText(label.text);
  if (!text) {
    throw new Error(`createText falhou para ${name}`);
  }
  text.fontSize = String(label.fontSize.value);
  text.fontWeight = label.fontWeight.value;
  text.fills = [
    {
      fillColor: label.color.hex,
      fillOpacity: label.color.opacity,
    },
  ];
  text.growType = 'auto-width';
  applyFontFamily(text, label.fontFamily.token, label.fontFamily.value);
  board.appendChild(text);

  const component = penpot.library.local.createComponent([board]);
  if (!component) {
    throw new Error(`createComponent falhou para ${name}`);
  }
  component.name = name;
  markComponentSource(component, SOURCE);

  const main = component.mainInstance();
  if (main.type !== 'board') {
    throw new Error(`mainInstance de ${name} não é board.`);
  }
  return { main, componentId: component.id };
}
