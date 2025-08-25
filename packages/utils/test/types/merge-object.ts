import type { MergeObject } from '@ez4/utils';

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

// Expect full model with arrays combined.
export const testA: FullModel = {
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

// Expect full model with undefined values.
export const testB: FullModel = {
  foo: 123,
  bar: undefined,
  baz: {
    barFoo: [false],
    barBar: undefined,
    barBaz: undefined
  },
  qux: undefined
};
