import type { UnionSchema } from '@ez4/schema';

import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { getSchemaProperty, SchemaType } from '@ez4/schema';

describe('union schema property utils', () => {
  const fullSchema: UnionSchema = {
    type: SchemaType.Union,
    elements: [
      {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          foo: {
            type: SchemaType.Number
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
          foo: {
            type: SchemaType.Number
          },
          baz: {
            type: SchemaType.String
          },
          qux: {
            type: SchemaType.Number
          }
        }
      }
    ]
  };

  it("assert :: get 'foo' schema property without repeating", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'foo');

    deepEqual(schemaProperty, {
      type: SchemaType.Number
    });
  });
});
