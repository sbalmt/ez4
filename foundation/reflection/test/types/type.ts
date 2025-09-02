type Type<T, U> = {
  field1: T;
  field2: U;
};

type Alias1<T> = Type<null, T>;
type Alias2<T = unknown> = Alias1<T>;
type Alias3 = Alias2<undefined>;

export interface Template {
  // Generic
  generic1: Type<any, never>;
  generic2: Alias1<void>;
  generic3: Alias2;
  generic4: Alias3;

  // Array
  array1: Alias1<null[]>;
  array2: Alias2[];
}
