import type { PartialObject } from '@ez4/utils';

import { assertType } from '@ez4/utils';

type BaseModel = {
  foo: number;
  bar?: boolean;
  baz?: string;
  qux: {
    quxFoo: boolean;
    quxBar: number;
    quxBaz: string;
  };
};

// Don't expect 'foo'
export const testA = () => {
  type CustomModel = PartialObject<BaseModel, { foo: false }>;

  type ExpectedType = {};

  assertType<ExpectedType, CustomModel>(true);
};

// Expect only 'foo'
export const testB = () => {
  type CustomModel = PartialObject<BaseModel, { foo: true }>;

  type ExpectedType = {
    foo: number;
  };

  assertType<ExpectedType, CustomModel>(true);

  const test: CustomModel = {
    foo: 123
  };

  return [test];
};

// Expect only 'baz' (which can be undefined)
export const testC = () => {
  type CustomModel = PartialObject<BaseModel, { baz: boolean }>;

  type ExpectedType = {
    baz?: string | undefined;
  };

  assertType<ExpectedType, CustomModel>(true);

  const test1: CustomModel = {
    baz: undefined
  };

  const test2: CustomModel = {
    baz: 'abc'
  };

  return [test1, test2];
};

// Expect only 'foo' and 'bar' (which can be undefined)
export const testD = () => {
  type CustomModel = PartialObject<BaseModel, { foo: true; bar: true }>;

  type ExpectedType = {
    foo: number;
    bar?: boolean | undefined;
  };

  assertType<ExpectedType, CustomModel>(true);

  const test1: CustomModel = {
    foo: 123,
    bar: true
  };

  const test2: CustomModel = {
    foo: 123,
    bar: undefined
  };

  return [test1, test2];
};

// Expect only 'qux'
export const testE = () => {
  type CustomModel = PartialObject<BaseModel, { qux: true }>;

  type ExpectedType = {
    qux: {
      quxFoo: boolean;
      quxBar: number;
      quxBaz: string;
    };
  };

  assertType<ExpectedType, CustomModel>(true);

  const test: CustomModel = {
    qux: {
      quxFoo: true,
      quxBar: 123,
      quxBaz: 'abc'
    }
  };

  return [test];
};

// Expect only 'quxBar' inside 'qux'
export const testF = () => {
  type CustomModel = PartialObject<BaseModel, { qux: { quxBar: true } }>;

  type ExpectedType = {
    qux: {
      quxBar: number;
    };
  };

  assertType<ExpectedType, CustomModel>(true);

  const test: CustomModel = {
    qux: {
      quxBar: 123
    }
  };

  return [test];
};

// Expect only 'quxFoo' inside 'qux' (which can be undefined)
export const testG = () => {
  type CustomModel = PartialObject<BaseModel, { qux: false | { quxFoo: true } }>;

  type ExpectedType = {
    qux:
      | {
          quxFoo: boolean;
        }
      | undefined;
  };

  assertType<ExpectedType, CustomModel>(true);

  const test1: CustomModel = {
    qux: {
      quxFoo: false
    }
  };

  const test2: CustomModel = {
    qux: undefined
  };

  return [test1, test2];
};
