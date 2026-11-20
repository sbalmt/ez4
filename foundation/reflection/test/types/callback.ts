type Type<T> = T;

export interface Callback {
  // Regular
  regular1: () => any;
  regular2: (param: any) => void;
  regular3: (param1: any, ...param2: void[]) => never;

  // Generic
  generic1: <T extends string>(input: T) => T;
  generic2: <T>(input: T) => T;
  generic3: <T = number>(input: T) => T;

  // Template
  template: Type<(param1: any, ...param2: void[]) => never>;
}
