import type { IsObjectEmpty, PartialObject } from '@ez4/utils';

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

type CustomModelA = PartialObject<BaseModel, { foo: false }>;
type CustomModelB = PartialObject<BaseModel, { foo: true }>;
type CustomModelC = PartialObject<BaseModel, { baz: boolean }>;
type CustomModelD = PartialObject<BaseModel, { foo: true; bar: true }>;
type CustomModelE = PartialObject<BaseModel, { qux: true }>;
type CustomModelF = PartialObject<BaseModel, { qux: { barBar: true } }>;

// Don't expect 'foo'
export const testA: IsObjectEmpty<CustomModelA> extends true ? true : false = true;

// Expect only 'foo'
export const testB: CustomModelB = {
  foo: 123
};

// Expect only 'baz' (which can be undefined)
export const testC1: CustomModelC = {
  baz: undefined
};

export const testC2: CustomModelC = {
  baz: 'abc'
};

// Expect only 'foo' and 'bar' (which can be undefined)
export const testD1: CustomModelD = {
  foo: 123,
  bar: true
};

export const testD2: CustomModelD = {
  foo: 123,
  bar: undefined
};

// Expect only 'qux'
export const testE: CustomModelE = {
  qux: {
    barFoo: true,
    barBar: 123,
    barBaz: 'abc'
  }
};

// Expect only 'barBar' inside 'qux'
export const testF: CustomModelF = {
  qux: {
    barBar: 123
  }
};
