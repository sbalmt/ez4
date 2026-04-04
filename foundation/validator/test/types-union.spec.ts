import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { ExpectedStringTypeError, ExpectedObjectTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('union type validation', () => {
  it('assert :: union', async () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      optional: true,
      nullable: true,
      elements: [
        {
          type: SchemaType.Boolean
        },
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    equal((await validate(true, schema)).length, 0);
    equal((await validate(123, schema)).length, 0);
    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: union errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          identity: 1,
          properties: {
            foo: {
              type: SchemaType.String
            },
            bar: {
              type: SchemaType.String
            }
          }
        },
        {
          type: SchemaType.Object,
          identity: 2,
          properties: {
            baz: {
              type: SchemaType.Number
            },
            qux: {
              type: SchemaType.Number
            }
          }
        }
      ]
    };

    // No matching objects
    await assertError(null, schema, [ExpectedObjectTypeError, ExpectedObjectTypeError]);
    await assertError(undefined, schema, [ExpectedObjectTypeError, ExpectedObjectTypeError]);

    // First matching object properties only.
    await assertError({ foo: 123 }, schema, [ExpectedStringTypeError, ExpectedStringTypeError]);
  });
});
