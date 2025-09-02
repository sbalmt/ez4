import type { LiteralBooleanType } from '../shared/types';

type Type<T> = T;

export interface Boolean {
  // Regular
  regular1: boolean;
  regular2: true;
  regular3: false;

  // Template
  template1: Type<boolean>;
  template2: Type<true>;
  template3: Type<false>;

  // Import
  import1: LiteralBooleanType;
  import2: Type<LiteralBooleanType>;
}
