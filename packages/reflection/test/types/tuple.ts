import type { LiteralTupleType } from '../shared/types.js';

type Type<T> = T;

export interface Tuple {
  // Regular
  regular: [any, void, never];

  // Spread
  spread: [any, ...[void, unknown]];

  // Template
  template1: Type<[unknown, undefined]>;
  template2: [Type<any>, Type<null>];

  // Import:
  import1: LiteralTupleType;
  import2: Type<LiteralTupleType>;
}
