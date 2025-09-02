type Type<T> = T;

const enum EmptyEnum {}

enum SingleEnum {
  V = 'v'
}

const enum FullEnum {
  V1 = 'v1',
  V2 = 2
}

export interface Enum {
  // Regular
  regular1: EmptyEnum;
  regular2: SingleEnum;
  regular3: FullEnum;
  regular4: FullEnum.V1;

  // Template
  template1: Type<EmptyEnum>;
  template2: Type<SingleEnum>;
  template3: Type<FullEnum>;
  template4: Type<FullEnum.V2>;
}
