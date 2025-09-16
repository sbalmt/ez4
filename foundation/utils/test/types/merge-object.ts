import type { MergeObject } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModelA = {
  foo: number;
  baz: {
    barFoo: boolean[];
    barBar: number;
    barBaz?: {
      barBazFoo: number;
    }[];
  };
};

type BaseModelB = {
  bar?: string[];
  baz: {
    barBar?: string;
    barBaz?: {
      barBazFoo: string[];
    };
  };
  qux?: {
    quxFoo: boolean;
  };
};

type FullModel = MergeObject<BaseModelA, BaseModelB>;

type ExpectedType = {
  foo: number;
  baz: {
    barFoo: boolean[];
    barBar: string | number | undefined;
    barBaz:
      | {
          barBazFoo: (string | number)[];
        }[]
      | undefined;
  };
  bar: string[] | undefined;
  qux:
    | {
        quxFoo: boolean;
      }
    | undefined;
};

assertType<ExpectedType, FullModel>(true);

// Expect full model with arrays combined.
export const testA = () => {
  const test: FullModel = {
    foo: 123,
    bar: ['abc'],
    baz: {
      barFoo: [true],
      barBar: 456,
      barBaz: [
        {
          barBazFoo: ['def', 789]
        }
      ]
    },
    qux: {
      quxFoo: false
    }
  };

  return [test];
};

// Expect full model with undefined values.
export const testB = () => {
  const test: FullModel = {
    foo: 123,
    bar: undefined,
    baz: {
      barFoo: [false],
      barBar: undefined,
      barBaz: undefined
    },
    qux: undefined
  };

  return [test];
};
