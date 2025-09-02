import type { OptionalProperties, RequiredProperties } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo: number;
  bar?: boolean;
  baz?: string;
  qux: {
    barFoo: boolean;
    barBar: number;
    barBaz: string;
  };
};

// Expect required properties.
export const testA = () => {
  type RequiredModelProperties = RequiredProperties<BaseModel>;

  type ExpectedType = 'foo' | 'qux';

  assertType<ExpectedType, RequiredModelProperties>(true);
};

// Expect optional properties.
export const testB = () => {
  type OptionalModelProperties = OptionalProperties<BaseModel>;

  type ExpectedType = 'bar' | 'baz';

  assertType<ExpectedType, OptionalModelProperties>(true);
};
