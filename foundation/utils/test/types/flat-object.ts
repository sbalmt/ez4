import type { FlatObject } from '@ez4/utils';

import { assertType } from '@ez4/utils';

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

type ExpectedType = {
  foo: number;
  bar?: string;
  baz: {
    barFoo: boolean;
    barBar: number | undefined;
    barBaz?: {
      barBazFoo: string;
    };
  };
};

assertType<ExpectedType, FlatModel>(true);

// Expect flat model without array values.
export const testA = () => {
  const test: FlatModel = {
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

  return [test];
};

// Expect flat model with undefined values.
export const testB = () => {
  const test: FlatModel = {
    foo: 123,
    bar: undefined,
    baz: {
      barFoo: false,
      barBar: undefined,
      barBaz: undefined
    }
  };

  return [test];
};
