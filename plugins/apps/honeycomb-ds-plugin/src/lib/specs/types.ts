import type { ResolvedColor, ResolvedNumber } from '../docs/types.js';

export type SpecValue<T> = {
  value: T;
  token: string | null;
};

export type ButtonVariantAxes = {
  variant: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size: 'small' | 'medium' | 'large';
  state: 'default' | 'pressed' | 'disabled';
};

export type ButtonVariantSpec = {
  props: ButtonVariantAxes;
  layout: {
    height: SpecValue<number>;
    minWidth: SpecValue<number>;
    horizontalPadding: SpecValue<number>;
    borderRadius: SpecValue<number>;
  };
  fills: {
    background: ResolvedColor;
  };
  strokes: {
    border: ResolvedColor & { width: number };
  };
  label: {
    text: string;
    fontSize: SpecValue<number>;
    fontWeight: SpecValue<string>;
    fontFamily: SpecValue<string>;
    lineHeight: SpecValue<number>;
    color: ResolvedColor;
  };
};

export type ComponentSetSpec = {
  styleDataRef: string;
  kind: 'componentSet';
  name: string;
  axes: string[];
  variants: ButtonVariantSpec[];
};

export type ComponentsBundle = {
  version: 1;
  components: ComponentSetSpec[];
  coverage: {
    widgetsInDocs: string[];
    withBuilder: string[];
    withoutBuilder: string[];
  };
};

export type { ResolvedNumber };
