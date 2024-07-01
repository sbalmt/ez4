type Type<T> = T;

export interface Special {
  // Regular
  regular1: any;
  regular2: void;
  regular3: never;
  regular4: unknown;
  regular5: undefined;
  regular6: null;

  // Template
  template1: Type<any>;
  template2: Type<void>;
  template3: Type<never>;
  template4: Type<unknown>;
  template5: Type<undefined>;
  template6: Type<null>;
}
