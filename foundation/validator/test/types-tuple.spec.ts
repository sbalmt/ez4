import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { ExpectedNumberTypeError, ExpectedStringTypeError, ExpectedTupleTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('tuple type validation', () => {
  it('assert :: tuple', async () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      optional: true,
      nullable: true,
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    equal((await validate([123, 'abc'], schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: tuple (default)', async () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      definitions: {
        default: ['abc', 123]
      },
      elements: [
        {
          type: SchemaType.String
        },
        {
          type: SchemaType.Number
        }
      ]
    };

    equal((await validate(undefined, schema)).length, 0);
  });

  it('assert :: tuple errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    await assertError(null, schema, [ExpectedTupleTypeError]);
    await assertError(undefined, schema, [ExpectedTupleTypeError]);
    await assertError([123, false], schema, [ExpectedNumberTypeError, ExpectedStringTypeError]);
  });
});
