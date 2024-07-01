type Type<T> = T;

export interface String {
  // Regular
  regular1: string;
  regular2: 'abc';
  regular3: `def`;

  // Template
  template1: Type<string>;
  template2: Type<'abc'>;
  template3: Type<`def`>;
}
