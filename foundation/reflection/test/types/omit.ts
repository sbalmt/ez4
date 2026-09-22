type Base = {
  foo: string;
  bar?: number | null;
  baz: boolean;
};

type ExcludeKeys<Type, Key extends keyof Type> = Omit<Type, Key>;

type Keys = 'bar' | 'foo';

export interface Omits {
  empty: Omit<Base, never>;

  single: Omit<Base, 'foo'>;

  multiple: Omit<Base, Keys>;

  generic: ExcludeKeys<Base, 'bar'>;

  numeric: Omit<{ 0: string; 1: number }, 0>;

  partial: Omit<Partial<Base>, 'foo'>;

  required: Required<Omit<Base, 'foo'>>;

  all: Omit<Base, 'foo' | 'bar' | 'baz'>;

  unknown: Omit<Base, 'missing'>;
}
