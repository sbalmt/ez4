import type { UnionSchema } from '@ez4/schema';

import { deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { getSchemaProperty, SchemaType } from '@ez4/schema';

describe('schema property enum utils', () => {
  const fullSchema: UnionSchema = {
    type: SchemaType.Union,
    elements: [
      {
        type: SchemaType.Object,
        identity: 1,
        properties: {
          foo: {
            type: SchemaType.String,
            definitions: {
              value: 'a'
            }
          },
          bar: {
            type: SchemaType.Number,
            definitions: {
              value: 3
            }
          }
        }
      },
      {
        type: SchemaType.Object,
        identity: 2,
        properties: {
          foo: {
            type: SchemaType.String,
            definitions: {
              value: 'b'
            }
          },
          bar: {
            type: SchemaType.Number,
            definitions: {
              value: 2
            }
          }
        }
      },
      {
        type: SchemaType.Object,
        identity: 3,
        properties: {
          foo: {
            type: SchemaType.String,
            definitions: {
              value: 'c'
            }
          },
          bar: {
            type: SchemaType.Number,
            definitions: {
              value: 1
            }
          }
        }
      }
    ]
  };

  it("assert :: get 'foo' schema property as a combined enum", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'foo');

    deepEqual(schemaProperty, {
      type: SchemaType.Enum,
      options: [
        {
          value: 'a'
        },
        {
          value: 'b'
        },
        {
          value: 'c'
        }
      ]
    });
  });

  it("assert :: get 'bar' schema property as a combined enum", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'bar');

    deepEqual(schemaProperty, {
      type: SchemaType.Enum,
      options: [
        {
          value: 3
        },
        {
          value: 2
        },
        {
          value: 1
        }
      ]
    });
  });
});
