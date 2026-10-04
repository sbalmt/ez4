export type FunctionCallback = <T = unknown>(...inputs: unknown[]) => T;

export type FunctionSource = FunctionFileSource | FunctionModuleSource;

export type FunctionFileSource = {
  file: string;
  name: string;
};

export type FunctionModuleSource = {
  module: string;
  name: string;
};
