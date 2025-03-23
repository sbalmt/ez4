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
  UnexpectedMaxItemsError,
  UnexpectedMinLengthError,
  UnexpectedMinRangeError,
  UnexpectedMinItemsError,
  UnexpectedNumberError,
  UnexpectedStringError
} from '@ez4/validator';

import { SchemaType } from '@ez4/schema';

import { assertError } from './common.js';

describe('rich type validation errors', () => {
  it('assert :: decimal errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      format: 'decimal',
      definitions: {
        minValue: 0.99,
        maxValue: 1.99
      }
    };

    await assertError(0.98, schema, [UnexpectedMinRangeError]);
    await assertError(2.0, schema, [UnexpectedMaxRangeError]);
  });

  it('assert :: integer errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      format: 'integer',
      definitions: {
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
      type: SchemaType.String,
      definitions: {
        minLength: 1,
        maxLength: 3
      }
    };

    await assertError('', schema, [UnexpectedMinLengthError]);
    await assertError('abcd', schema, [UnexpectedMaxLengthError]);
  });

  it('assert :: decimal (literal) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        value: 123.456
      }
    };

    await assertError(456.789, schema, [UnexpectedNumberError]);
  });

  it('assert :: integer (literal) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        value: 123
      }
    };

    await assertError(456, schema, [UnexpectedNumberError]);
  });

  it('assert :: string (literal) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        value: 'abc'
      }
    };

    await assertError('def', schema, [UnexpectedStringError]);
  });

  it('assert :: string (regex) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'regex',
      definitions: {
        pattern: '^[a-b]+$'
      }
    };

    await assertError('123', schema, [ExpectedRegexTypeError]);
  });

  it('assert :: string (uuid) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'uuid'
    };

    await assertError('', schema, [ExpectedUUIDTypeError]);
  });

  it('assert :: string (email) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'email'
    };

    await assertError('', schema, [ExpectedEmailTypeError]);
  });

  it('assert :: string (time) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'time'
    };

    await assertError('abc', schema, [ExpectedTimeTypeError]);
  });

  it('assert :: string (date) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'date'
    };

    await assertError('abc', schema, [ExpectedDateTypeError]);
  });

  it('assert :: string (date-time) errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'date-time'
    };

    await assertError('abc', schema, [ExpectedDateTimeTypeError]);
  });

  it('assert :: array errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      definitions: {
        minLength: 1,
        maxLength: 2
      },
      element: {
        type: SchemaType.Number
      }
    };

    await assertError([], schema, [UnexpectedMinItemsError]);
    await assertError([1, 2, 3], schema, [UnexpectedMaxItemsError]);
  });
});
