import type { Exclusive } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModelA = {
  foo: number;
  baz: string;
};

type BaseModelB = {
  bar?: string[];
  baz: number;
  qux: boolean;
};

type ExpectedType =
  | {
      foo: number;
      bar?: never;
      baz: string;
      qux?: never;
    }
  | {
      foo?: never;
      bar?: string[];
      baz: number;
      qux: boolean;
    };

assertType<ExpectedType, Exclusive<BaseModelA, BaseModelB>>(true);

// Expect exclusively model A or model B
export const testA = () => {
  const test: Exclusive<BaseModelA, BaseModelB>[] = [
    {
      foo: 123,
      baz: 'abc'
    },
    {
      bar: ['abc'],
      baz: 123,
      qux: true
    }
  ];

  return [test];
};
