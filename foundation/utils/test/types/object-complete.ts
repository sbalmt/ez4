import type { Complete } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo?: number | undefined | null;
  bar?: string[] | undefined | null;
  baz?: boolean | undefined | null;
};

type ExpectedType = {
  foo: number;
  bar: string[];
  baz: boolean;
};

assertType<ExpectedType, Complete<BaseModel>>(true);

// Expect an incomplete model object.
export const testA = () => {
  const test: Complete<BaseModel> = {
    foo: 123,
    bar: ['bar'],
    baz: true
  };

  return [test];
};
