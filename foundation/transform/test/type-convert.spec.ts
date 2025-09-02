import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('convert type transformation', () => {
  it('assert :: conversion enabled', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.String
        },
        bar: {
          type: SchemaType.Number
        }
      }
    };

    const input = {
      foo: 'abc',
      bar: '123',

      // Ignored properties
      baz: 'true'
    };

    const output = {
      foo: 'abc',
      bar: 123
    };

    const context = createTransformContext({
      convert: true
    });

    deepEqual(transform(input, schema, context), output);
  });

  it("assert :: conversion enabled (shouldn't convert encoded object type)", async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Object,
          identity: 2,
          definitions: {
            encoded: true
          },
          properties: {
            bar: {
              type: SchemaType.Boolean
            },
            baz: {
              type: SchemaType.Number
            }
          }
        }
      }
    };

    const json = {
      bar: 'true',
      baz: '123'
    };

    const input = {
      foo: Buffer.from(JSON.stringify(json)).toString('base64')
    };

    const output = {
      foo: json
    };

    const context = createTransformContext({
      convert: true
    });

    deepEqual(transform(input, schema, context), output);
  });

  it("assert :: conversion enabled (shouldn't convert encoded array type)", async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Array,
          definitions: {
            encoded: true
          },
          element: {
            type: SchemaType.Boolean
          }
        }
      }
    };

    const json = ['true', 'false'];

    const input = {
      foo: Buffer.from(JSON.stringify(json)).toString('base64')
    };

    const output = {
      foo: json
    };

    const context = createTransformContext({
      convert: true
    });

    deepEqual(transform(input, schema, context), output);
  });

  it('assert :: conversion disabled', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.String
        },
        bar: {
          type: SchemaType.Number
        }
      }
    };

    const input = {
      foo: 'abc',
      bar: '123',

      // Ignored properties
      baz: 'true'
    };

    const output = {
      foo: 'abc',
      bar: '123'
    };

    const context = createTransformContext({
      convert: false
    });

    deepEqual(transform(input, schema, context), output);
  });
});
