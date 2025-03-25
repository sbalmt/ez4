import type { AnySchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import { createValidatorContext, validate } from '@ez4/validator';
import { SchemaType } from '@ez4/schema';

describe.only('type depth validation', () => {
  it('assert :: object depth', async ({ assert }) => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Boolean
        },
        bar: {
          type: SchemaType.Number
        },
        baz: {
          type: SchemaType.String
        }
      }
    };

    const context = createValidatorContext({ depth: 0 });

    // Validate only the object 1st level (which include properties)
    assert.equal((await validate({ foo: undefined, bar: null, baz: undefined }, schema, context)).length, 0);

    // Still catch unexpected properties
    assert.equal((await validate({ wrong_prop: 'foo' }, schema, context)).length, 1);
  });

  it('assert :: array depth', async ({ assert }) => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    // Validate only the array type and length, don't check its elements.
    const context = createValidatorContext({ depth: 0 });

    assert.equal((await validate([undefined, null], schema, context)).length, 0);
  });

  it('assert :: tuple depth', async ({ assert }) => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    // Validate only the tuple type and don't check its elements.
    const context = createValidatorContext({ depth: 0 });

    assert.equal((await validate([undefined, null], schema, context)).length, 0);
  });
});
