export type HoneycombProperty = {
  name: string;
  defaultValue?: string | null;
  tokenValue?: number | string | null;
  type?: string;
  parent?: string;
};

export type ComponentStyleEntry = {
  kind?: string;
  object?: {
    styleDataRef?: string;
    properties?: HoneycombProperty[];
    type?: string;
  };
};

export type WidgetEntry = {
  kind?: string;
  object?: {
    parserName?: string;
    type?: string;
    properties?: HoneycombProperty[];
    states?: string[];
  };
};

export type TokenDataEntry = {
  kind?: string;
  object?: {
    tokenAccessProperty?: string;
    defaultTokenValues?: Record<string, number>;
    defaultTokenValueExpressions?: Record<string, string>;
  };
};

export type HoneycombDocs = {
  componentStyle?: ComponentStyleEntry[];
  styleOverrides?: unknown[];
  widget?: WidgetEntry[];
  tokenData?: TokenDataEntry[];
};

export type ResolvedColor = {
  hex: string;
  opacity: number;
  token: string | null;
};

export type ResolvedNumber = {
  value: number;
  token: string | null;
};

export type ResolvedTypography = {
  fontFamilyToken: string | null;
  fontWeightToken: string | null;
  fontSize: number;
  lineHeight: number;
  color: ResolvedColor;
};
