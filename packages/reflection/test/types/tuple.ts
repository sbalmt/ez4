type Type<T> = T;

export interface Tuple {
  // Regular
  regular: [any, void, never];

  // Template
  template1: Type<[unknown, undefined]>;
  template2: [Type<any>, Type<null>];
}
