import { describe, it } from 'node:test';
import { deepEqual } from 'assert/strict';

import { ObjectSchema, partialObjectSchema, SchemaTypeName } from '@ez4/schema/library';

describe.only('schema utils', () => {
  const fullSchema: ObjectSchema = {
    type: SchemaTypeName.Object,
    properties: {
      foo: {
        type: SchemaTypeName.String
      },
      bar: {
        type: SchemaTypeName.Number
      },
      baz: {
        type: SchemaTypeName.Object,
        properties: {
          bazFoo: {
            type: SchemaTypeName.Boolean
          },
          bazBar: {
            type: SchemaTypeName.String
          }
        }
      }
    }
  };

  it('assert :: partial schema', () => {
    const partialSchema = partialObjectSchema(fullSchema, {
      bar: true,
      baz: {
        bazBar: true
      }
    });

    deepEqual(partialSchema, {
      type: SchemaTypeName.Object,
      properties: {
        bar: {
          type: SchemaTypeName.Number
        },
        baz: {
          type: SchemaTypeName.Object,
          properties: {
            bazBar: {
              type: SchemaTypeName.String
            }
          }
        }
      }
    });
  });
});
