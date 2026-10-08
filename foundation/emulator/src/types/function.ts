export type FunctionCallback = <R = unknown, I = unknown>(...inputs: I[]) => R;

export type FunctionSource = FunctionFileSource | FunctionModuleSource;

export type FunctionFileSource = {
  file: string;
  name: string;
};

export type FunctionModuleSource = {
  module: string;
  name: string;
};
