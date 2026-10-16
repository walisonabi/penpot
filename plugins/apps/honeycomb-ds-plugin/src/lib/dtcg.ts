import type { ButtonPrimarySpec } from './honeycomb-docs.js';

export function buttonTokensToDtcg(spec: ButtonPrimarySpec): Record<string, unknown> {
  const setName = 'hexa-button';
  return {
    [setName]: {
      color: {
        'button-primary-bg': {
          $type: 'color',
          $value: spec.backgroundHex,
        },
        'button-primary-text': {
          $type: 'color',
          $value: spec.textHex,
        },
      },
      dimension: {
        'button-medium-height': {
          $type: 'dimension',
          $value: `${spec.height}px`,
        },
        'button-medium-padding-x': {
          $type: 'dimension',
          $value: `${spec.horizontalPadding}px`,
        },
        'button-medium-min-width': {
          $type: 'dimension',
          $value: `${spec.minWidth}px`,
        },
      },
      borderRadius: {
        'button-medium-radius': {
          $type: 'borderRadius',
          $value: `${Math.min(spec.borderRadius, 999)}px`,
        },
      },
      typography: {
        'button-medium-label': {
          $type: 'typography',
          $value: {
            fontFamilies: ['Inter'],
            fontSizes: String(spec.fontSize),
            fontWeights: '600',
          },
        },
      },
    },
    $metadata: {
      tokenSetOrder: [setName],
    },
    $themes: [
      {
        id: 'hexa-default',
        name: 'Hexa Default',
        selectedTokenSets: {
          [setName]: 'enabled',
        },
      },
    ],
  };
}
