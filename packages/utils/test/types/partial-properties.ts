import type { PartialProperties } from '@ez4/utils';

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

type ModelProperties = PartialProperties<BaseModel>;

// Assign only 'foo'
export const valueA: ModelProperties = {
  foo: true
};

// Expect only 'barFoo' inside 'bar'
export const valueB: ModelProperties = {
  bar: {
    barFoo: true,
    barBaz: false
  }
};
