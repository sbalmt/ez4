type Type<T> = T;

type TypeFoo = { foo: string };
type TypeBar = { bar: boolean };

export interface Intersection {
  // Regular
  regular: TypeFoo & TypeBar;

  // Template
  template: Type<{ foo: string }> & Type<{ bar: boolean }>;

  // Inline
  inline: { foo: boolean } & { foo: number; bar: string };
}
