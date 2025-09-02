type Type<T> = T;

export interface Callback {
  // Regular
  regular1: () => any;
  regular2: (param: any) => void;
  regular3: (param1: any, ...param2: void[]) => never;

  // Template
  template: Type<(param1: any, ...param2: void[]) => never>;
}
