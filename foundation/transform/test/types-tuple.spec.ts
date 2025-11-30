import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { createTransformContext, transform } from '@ez4/transform';

describe('tuple type transformation', () => {
  it('assert :: tuple', () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
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

    deepEqual(transform(['123', 'abc'], schema), [123, 'abc']);
    deepEqual(transform([456, 'def'], schema), [456, 'def']);

    deepEqual(transform(['true', '4.56'], schema), ['true', '4.56']);

    deepEqual(transform(123, schema), 123);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: tuple (default)', () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      definitions: {
        default: [456, 'def']
      },
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    // transform
    deepEqual(transform(['123', 'abc'], schema), [123, 'abc']);

    // incompatible
    deepEqual(transform(['true', '4.56'], schema), ['true', '4.56']);
    deepEqual(transform(123, schema), 123);
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), [456, 'def']);
  });

  it('assert :: tuple (no return)', () => {
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

    const context = createTransformContext({
      return: false
    });

    deepEqual(transform(['123', 'abc'], schema, context), [123, 'abc']);
    deepEqual(transform([456, 'def'], schema, context), [456, 'def']);

    deepEqual(transform(['true', '4.56'], schema, context), [undefined, '4.56']);

    deepEqual(transform(123, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: tuple (from string)', () => {
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

    deepEqual(transform('123, abc', schema), [123, 'abc']);
  });
});
