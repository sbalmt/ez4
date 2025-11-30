type TypeFoo = { foo: string };
type TypeBar = { bar: boolean };

export interface Intersection {
  regular: TypeFoo & TypeBar;
}
