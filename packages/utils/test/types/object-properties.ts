import type { OptionalProperties, RequiredProperties } from '@ez4/utils';

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

type RequiredModelProperties = RequiredProperties<BaseModel>;
type OptionalModelProperties = OptionalProperties<BaseModel>;

// Expect required properties.
export const testA: RequiredModelProperties = 'foo';
export const testB: RequiredModelProperties = 'qux';

// Expect optional properties.
export const testC: OptionalModelProperties = 'bar';
export const testD: OptionalModelProperties = 'baz';
