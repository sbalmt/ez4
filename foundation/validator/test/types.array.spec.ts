import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { ExpectedStringTypeError, ExpectedArrayTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('array type validation', () => {
  it('assert :: array', async () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      optional: true,
      nullable: true,
      element: {
        type: SchemaType.Number
      }
    };

    equal((await validate([123, 456], schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: array errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.String
      }
    };

    await assertError(null, schema, [ExpectedArrayTypeError]);
    await assertError(undefined, schema, [ExpectedArrayTypeError]);
    await assertError(['abc', 123, true], schema, [ExpectedStringTypeError, ExpectedStringTypeError]);
  });
});
