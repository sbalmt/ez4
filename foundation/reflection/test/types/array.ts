import type { LiteralArrayType } from '../shared/types.js';

type Type<T> = T;

export interface Array {
  // Regular
  regular1: any[];
  regular2: any[][];
  regular3: ArrayLike<any>;

  // Tuple
  tuple1: [any, ...any[]];
  tuple2: [any, ...[void, unknown]];

  // Union
  union: (any | void)[];

  // Template
  template: Type<any[]>;

  // Import
  import1: LiteralArrayType;
  import2: Type<LiteralArrayType>;
}
