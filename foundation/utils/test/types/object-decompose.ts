import type { Decompose } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo?: number | null;
  bar: string[] | undefined;
  baz: boolean;
  qux: {
    quxFoo: string;
  };
};

type ExpectedType = number | string[] | boolean | undefined | null | { quxFoo: string };

assertType<ExpectedType, Decompose<BaseModel>>(true);

// Expect a decomposed type.
export const testA = () => {
  const test: Decompose<BaseModel>[] = [123, ['foo'], true, null, undefined, { quxFoo: 'qux' }];

  return [test];
};
