import type { PartialProperties } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo: number;
  bar: {
    barFoo?: boolean;
    barBar: number | undefined;
    barBaz: string;
  };
  baz?: string;
  qux: undefined;
};

type ExpectedType = {
  foo?: boolean;
  bar?:
    | boolean
    | {
        barFoo?: boolean;
        barBar?: boolean;
        barBaz?: boolean;
      };
  baz?: boolean;
  qux?: boolean;
};

assertType<ExpectedType, PartialProperties<BaseModel>>(true);

// Assign only 'foo'
export const testA = () => {
  const test: PartialProperties<BaseModel> = {
    foo: true
  };

  return [test];
};

// Expect only 'barFoo' inside 'bar'
export const testB = () => {
  const test: PartialProperties<BaseModel> = {
    bar: {
      barFoo: true,
      barBaz: false
    }
  };

  return [test];
};
