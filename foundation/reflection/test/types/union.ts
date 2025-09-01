import type { LiteralUnionType } from '../shared/types';

type Type1<T> = T;
type Type2<T> = T | null;

export interface Union {
  // Regular
  regular: any | void | never;

  // Template
  template1: Type1<unknown | undefined>;
  template2: Type2<any> | never;

  // Import
  import1: LiteralUnionType;
  import2: Type1<LiteralUnionType>;
}
