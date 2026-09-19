type Base = {
  foo: string;
  bar?: number | null;
  baz: boolean;
};

type Select<Type, Key extends keyof Type> = Pick<Type, Key>;

type Keys = 'bar' | 'foo';

export interface Picks {
  empty: Pick<Base, never>;

  single: Pick<Base, 'foo'>;

  multiple: Pick<Base, Keys>;

  generic: Select<Base, 'bar'>;

  numeric: Pick<{ 0: string; 1: number }, 0>;

  partial: Pick<Partial<Base>, 'foo'>;

  required: Required<Pick<Base, 'bar'>>;
}
