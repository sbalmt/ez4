import type { LiteralTupleType } from '../shared/types';

type Type<T> = T;

export interface Tuple {
  // Regular
  regular: [any, void, never];

  // Labeled
  labeled: [foo: string, bar: number, baz: boolean];

  // Spread
  spread1: [any, ...[void, unknown]];
  spread2: [foo: string, ...bar: number[]];
  spread3: [foo: string, ...bar: [baz: number, qux: boolean]];

  // Template
  template1: Type<[unknown, undefined]>;
  template2: [Type<any>, Type<null>];
  template3: Type<[foo: Type<string>, bar: Type<number>]>;

  // Import
  import1: LiteralTupleType;
  import2: Type<LiteralTupleType>;

  // Mixed
  mixed: [string, foo: number, boolean];
}
