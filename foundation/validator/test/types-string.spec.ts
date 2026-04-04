import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { ExpectedStringTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('string type validation', () => {
  it('assert :: string', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      optional: true,
      nullable: true
    };

    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: string (default)', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        default: 'abc'
      }
    };

    equal((await validate(undefined, schema)).length, 0);
  });

  it('assert :: string errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.String
    };

    await assertError(null, schema, [ExpectedStringTypeError]);
    await assertError(undefined, schema, [ExpectedStringTypeError]);
    await assertError(123, schema, [ExpectedStringTypeError]);
  });
});
