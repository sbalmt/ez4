import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { validate } from '@ez4/validator';

describe.only('rich types validation', () => {
  it('assert :: decimal', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      format: 'decimal',
      definitions: {
        minValue: 0.99,
        maxValue: 1.99
      }
    };

    equal((await validate(1.55, schema)).length, 0);
  });

  it('assert :: integer', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      format: 'integer',
      definitions: {
        minValue: 99,
        maxValue: 199
      }
    };

    equal((await validate(155, schema)).length, 0);
  });

  it('assert :: string', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        minLength: 1,
        maxLength: 9
      }
    };

    equal((await validate('test', schema)).length, 0);
  });

  it('assert :: decimal (literal)', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        value: 123.456
      }
    };

    equal((await validate(123.456, schema)).length, 0);
  });

  it('assert :: integer (literal)', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        value: 123
      }
    };

    equal((await validate(123, schema)).length, 0);
  });

  it('assert :: string (literal)', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        value: 'abc'
      }
    };

    equal((await validate('abc', schema)).length, 0);
  });

  it('assert :: regex', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'regex',
      definitions: {
        pattern: '^[a-z]+$'
      }
    };

    equal((await validate('abc', schema)).length, 0);
  });

  it('assert :: uuid', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'uuid'
    };

    equal((await validate('e213a9e4-4a5c-4851-8341-f03f5b8ed168', schema)).length, 0);
  });

  it('assert :: email', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'email'
    };

    equal((await validate('a.b@c.de', schema)).length, 0);
  });

  it('assert :: time', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'time'
    };

    equal((await validate('19:45:00', schema)).length, 0);
  });

  it('assert :: date', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'date'
    };

    equal((await validate('1991-04-23', schema)).length, 0);
  });

  it('assert :: date-time', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'date-time'
    };

    equal((await validate('1991-04-23T19:45:00-03:00', schema)).length, 0);
  });

  it('assert :: extensible object', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      definitions: {
        extensible: true
      },
      properties: {
        foo: {
          type: SchemaType.String
        }
      }
    };

    equal((await validate({ foo: 'abc', bar: 123 }, schema)).length, 0);
  });

  it('assert :: array', async () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      definitions: {
        minLength: 1,
        maxLength: 9
      },
      element: {
        type: SchemaType.Number
      }
    };

    equal((await validate([1, 2, 3], schema)).length, 0);
  });
});
