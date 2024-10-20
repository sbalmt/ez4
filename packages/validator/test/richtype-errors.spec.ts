import type { AnySchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import {
  ExpectedDateTimeTypeError,
  ExpectedDateTypeError,
  ExpectedEmailTypeError,
  ExpectedIntegerTypeError,
  ExpectedRegexTypeError,
  ExpectedTimeTypeError,
  ExpectedUUIDTypeError,
  UnexpectedMaxLengthError,
  UnexpectedMaxRangeError,
  UnexpectedMinLengthError,
  UnexpectedMinRangeError,
  UnexpectedNumberError,
  UnexpectedStringError
} from '@ez4/validator';

import { SchemaTypeName } from '@ez4/schema';

import { assertError } from './common.js';

describe.only('rich type validation errors', () => {
  it('assert :: decimal errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number,
      format: 'decimal',
      extra: {
        minValue: 0.99,
        maxValue: 1.99
      }
    };

    await assertError(0.98, schema, [UnexpectedMinRangeError]);
    await assertError(2.0, schema, [UnexpectedMaxRangeError]);
  });

  it('assert :: integer errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number,
      format: 'integer',
      extra: {
        minValue: 99,
        maxValue: 199
      }
    };

    await assertError(98, schema, [UnexpectedMinRangeError]);
    await assertError(200, schema, [UnexpectedMaxRangeError]);
    await assertError(5.1, schema, [ExpectedIntegerTypeError]);
  });

  it('assert :: string errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      extra: {
        minLength: 1,
        maxLength: 3
      }
    };

    await assertError('', schema, [UnexpectedMinLengthError]);
    await assertError('abcd', schema, [UnexpectedMaxLengthError]);
  });

  it('assert :: decimal (literal) errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number,
      extra: {
        value: 123.456
      }
    };

    await assertError(456.789, schema, [UnexpectedNumberError]);
  });

  it('assert :: integer (literal) errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number,
      extra: {
        value: 123
      }
    };

    await assertError(456, schema, [UnexpectedNumberError]);
  });

  it('assert :: string (literal) errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      extra: {
        value: 'abc'
      }
    };

    await assertError('def', schema, [UnexpectedStringError]);
  });

  it('assert :: uuid errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'regex',
      extra: {
        pattern: '^[a-b]+$'
      }
    };

    await assertError('123', schema, [ExpectedRegexTypeError]);
  });

  it('assert :: uuid errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'uuid'
    };

    await assertError('', schema, [ExpectedUUIDTypeError]);
  });

  it('assert :: email errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'email'
    };

    await assertError('', schema, [ExpectedEmailTypeError]);
  });

  it('assert :: time errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'time'
    };

    await assertError('abc', schema, [ExpectedTimeTypeError]);
  });

  it('assert :: date errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'date'
    };

    await assertError('abc', schema, [ExpectedDateTypeError]);
  });

  it('assert :: date-date errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'date-time'
    };

    await assertError('abc', schema, [ExpectedDateTimeTypeError]);
  });
});
