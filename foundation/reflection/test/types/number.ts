import type { LiteralNumberType } from '../shared/types.js';

type Type<T> = T;

export interface Number {
  // Regular
  regular1: number;
  regular2: -123;
  regular3: 456;
  regular4: 7.89;
  regular5: 0xff;
  regular6: 0b11;
  regular7: 0o75;

  // Template
  template1: Type<number>;
  template2: Type<-123>;
  template3: Type<456>;
  template4: Type<7.89>;
  template5: Type<0xff>;
  template6: Type<0b11>;
  template7: Type<0o75>;

  // Import
  import1: LiteralNumberType;
  import2: Type<LiteralNumberType>;
}
