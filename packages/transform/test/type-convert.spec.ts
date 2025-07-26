import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('type conversion transform', () => {
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

  it('assert :: conversion enabled', async () => {
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

  it('assert :: conversion disabled', async () => {
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
