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
}
