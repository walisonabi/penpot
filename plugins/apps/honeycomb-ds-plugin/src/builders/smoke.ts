import { log } from './log.js';

/**
 * Diagnostic ladder: rectangle → board+text → two-variant set.
 * Returns the first step that fails, or null if all pass.
 */
export function runSmokeLadder(): string | null {
  if (!penpot.currentPage?.root) {
    return 'Nenhuma página ativa.';
  }

  log('Smoke 1/3: createRectangle → createComponent…');
  const rect = penpot.createRectangle();
  if (!rect) {
    return 'Smoke 1 falhou: createRectangle.';
  }
  rect.resize(40, 40);
  rect.fills = [{ fillColor: '#00aa00', fillOpacity: 1 }];
  const rectComp = penpot.library.local.createComponent([rect]);
  if (!rectComp) {
    return 'Smoke 1 falhou: createComponent(rectangle).';
  }
  rectComp.name = 'honeycomb-smoke-rect';
  try {
    (rectComp as { remove?: () => void }).remove?.();
  } catch {
    /* cleanup best-effort */
  }

  log('Smoke 2/3: createBoard + createText → createComponent…');
  const board = penpot.createBoard();
  if (!board) {
    return 'Smoke 2 falhou: createBoard.';
  }
  board.resize(80, 40);
  board.fills = [{ fillColor: '#141414', fillOpacity: 1 }];
  const label = penpot.createText('Ok');
  if (!label) {
    return 'Smoke 2 falhou: createText.';
  }
  board.appendChild(label);
  const boardComp = penpot.library.local.createComponent([board]);
  if (!boardComp) {
    return 'Smoke 2 falhou: createComponent(board+text).';
  }
  boardComp.name = 'honeycomb-smoke-board';

  log('Smoke 3/3: createVariantFromComponents…');
  const boardB = penpot.createBoard();
  boardB.resize(80, 40);
  boardB.fills = [{ fillColor: '#585858', fillOpacity: 1 }];
  const labelB = penpot.createText('Ok2');
  if (labelB) {
    boardB.appendChild(labelB);
  }
  const boardCompB = penpot.library.local.createComponent([boardB]);
  if (!boardCompB) {
    return 'Smoke 3 falhou: segundo createComponent.';
  }
  boardCompB.name = 'honeycomb-smoke-board-b';
  const mainA = boardComp.mainInstance();
  const mainB = boardCompB.mainInstance();
  if (mainA.type !== 'board' || mainB.type !== 'board') {
    return 'Smoke 3 falhou: mainInstance não é board.';
  }
  const container = penpot.createVariantFromComponents([mainA, mainB]);
  if (!container) {
    return 'Smoke 3 falhou: createVariantFromComponents.';
  }

  try {
    (boardComp as { remove?: () => void }).remove?.();
    (boardCompB as { remove?: () => void }).remove?.();
    container.remove?.();
  } catch {
    /* cleanup best-effort */
  }

  log('Smoke ladder OK.');
  return null;
}
