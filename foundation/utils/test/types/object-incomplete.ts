import type { Incomplete } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo: number;
  bar: string[];
  baz: boolean;
};

type ExpectedType = {
  foo?: number | undefined | null;
  bar?: string[] | undefined | null;
  baz?: boolean | undefined | null;
};

assertType<ExpectedType, Incomplete<BaseModel>>(true);

// Expect an incomplete model object.
export const testA = () => {
  const test: Incomplete<BaseModel> = {
    bar: null,
    baz: undefined
  };

  return [test];
};
