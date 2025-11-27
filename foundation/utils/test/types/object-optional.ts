import type { OptionalObject } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo: number;
  bar?: boolean | null;
  baz: { bazFoo: string }[];
  qux: {
    quxFoo: boolean | undefined;
    quxBar: string;
  };
};

type ExpectedType = {
  foo?: number;
  bar?: boolean | null;
  baz?: { bazFoo: string }[];
  qux?: {
    quxFoo?: boolean | undefined;
    quxBar?: string;
  };
};

assertType<ExpectedType, OptionalObject<BaseModel>>(true);

// Expect an optional model type
export const testA = () => {
  const test: OptionalObject<BaseModel> = {
    foo: 123,
    baz: [
      {
        bazFoo: 'abc'
      }
    ],
    qux: {
      quxBar: 'def'
    }
  };

  return [test];
};
