import type { StrictObject } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModelA = {
  foo?: number;
  baz: string;
  qux?: {
    quxBar: boolean;
  };
};

type BaseModelB = {
  bar: boolean;
  baz: boolean;
  qux: {
    quxFoo: boolean;
    quxBar: boolean;
    quxBaz: boolean;
  };
};

type ExpectedType = {
  baz: string;
  qux?: {
    quxBar: boolean;
  };
};

assertType<ExpectedType, StrictObject<BaseModelA, BaseModelB>>(true);

// Expect strictly properties from model A that exists in model B
export const testA = () => {
  const test: StrictObject<BaseModelA, BaseModelB> = {
    baz: 'abc',
    qux: {
      quxBar: true
    }
  };

  return [test];
};
