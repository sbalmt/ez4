import type { LiteralAnyType } from '../shared/types';

type Type<T> = T;

export declare class Special {
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

  // Import
  import1: LiteralAnyType;
  import2: Type<LiteralAnyType>;

  // Cyclic dependency
  self1: typeof this;
  self2: Special;
  self3: Type<typeof this>;
  self4: Type<Special>;

  // Index access
  index1: Special['regular1'];
  index2: Special['template1'];
  index3: Special['import1'];
  index4: Special['self1'];
}
