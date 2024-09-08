import type { LiteralTupleType } from '../shared/types.js';

type Type<T> = T;

export interface Tuple {
  // Regular
  regular: [any, void, never];

  // Template
  template1: Type<[unknown, undefined]>;
  template2: [Type<any>, Type<null>];

  // Import:
  import1: LiteralTupleType;
  import2: Type<LiteralTupleType>;
}
