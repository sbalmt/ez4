import type { FlatObject } from '@ez4/utils';

type BaseModel = {
  foo: number;
  bar?: string[];
  baz: {
    barFoo: boolean;
    barBar: number | undefined;
    barBaz?: {
      barBazFoo: string[];
    }[];
  };
};

type FlatModel = FlatObject<BaseModel>;

// Expect flat model without array values.
export const testA: FlatModel = {
  foo: 123,
  bar: 'abc',
  baz: {
    barFoo: false,
    barBar: 456,
    barBaz: {
      barBazFoo: 'def'
    }
  }
};

// Expect flat model with undefined values.
export const testB: FlatModel = {
  foo: 123,
  bar: undefined,
  baz: {
    barFoo: false,
    barBar: undefined,
    barBaz: undefined
  }
};
