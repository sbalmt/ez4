import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { ExpectedNumberTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('number type validation', () => {
  it('assert :: number', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      optional: true,
      nullable: true
    };

    equal((await validate(123, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: number (default)', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        default: 123
      }
    };

    equal((await validate(undefined, schema)).length, 0);
  });

  it('assert :: number errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number
    };

    await assertError(null, schema, [ExpectedNumberTypeError]);
    await assertError(undefined, schema, [ExpectedNumberTypeError]);
    await assertError(NaN, schema, [ExpectedNumberTypeError]);
    await assertError('123', schema, [ExpectedNumberTypeError]);
  });
});
