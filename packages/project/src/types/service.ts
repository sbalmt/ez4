export type LinkedVariables = Record<string, string>;

export type LinkedServices = Record<string, string>;

export type ServiceMetadata = {
  type: string;
  name: string;
  variables?: LinkedVariables | null;
  services?: LinkedServices | null;
  extras?: Record<string, ExtraSource>;
};

export type ExtraSource = {
  constructor: string;
  module: string;
  from: string;
};
