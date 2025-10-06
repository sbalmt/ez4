import type { UnionSchema } from '@ez4/schema';

import { deepEqual, ok } from 'assert/strict';
import { describe, it } from 'node:test';

import { getSchemaProperty, hasSchemaProperty, SchemaType } from '@ez4/schema';

describe('schema property utils', () => {
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
          baz: {
            type: SchemaType.String
          },
          qux: {
            type: SchemaType.Number
          }
        }
      },
      {
        type: SchemaType.Object,
        identity: 3,
        properties: {
          bar: {
            type: SchemaType.Number
          }
        }
      },
      {
        type: SchemaType.Object,
        identity: 4,
        properties: {
          abc: {
            type: SchemaType.Boolean
          }
        }
      }
    ]
  };

  it("assert :: get 'foo' schema property (first single object)", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'foo');

    deepEqual(schemaProperty, {
      type: SchemaType.Number
    });
  });

  it("assert :: get 'baz' schema property (second single object)", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'baz');

    deepEqual(schemaProperty, {
      type: SchemaType.String
    });
  });

  it("assert :: get 'abc' schema property (fourth single object)", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'abc');

    deepEqual(schemaProperty, {
      type: SchemaType.Boolean
    });
  });

  it("assert :: get 'bar' schema property (multiple objects)", () => {
    const schemaProperty = getSchemaProperty(fullSchema, 'bar');

    deepEqual(schemaProperty, {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.String
        },
        {
          type: SchemaType.Number
        }
      ]
    });
  });

  it("assert :: has 'bar' schema property", () => {
    const schemaProperty = hasSchemaProperty(fullSchema, 'bar');

    ok(schemaProperty);
  });

  it("assert :: has 'qux' schema property", () => {
    const schemaProperty = hasSchemaProperty(fullSchema, 'qux');

    ok(schemaProperty);
  });
});
