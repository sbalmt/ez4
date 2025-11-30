import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('enum type transformation', () => {
  it('assert :: enum', () => {
    const schema: AnySchema = {
      type: SchemaType.Enum,
      nullable: true,
      options: [
        {
          value: 123
        },
        {
          value: 'abc'
        }
      ]
    };

    deepEqual(transform('123', schema), 123);

    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(123, schema), 123);

    deepEqual(transform(true, schema), true);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: enum (default)', () => {
    const schema: AnySchema = {
      type: SchemaType.Enum,
      definitions: {
        default: 123
      },
      options: [
        {
          value: 123
        },
        {
          value: 'abc'
        }
      ]
    };

    // transform
    deepEqual(transform('123', schema), 123);
    deepEqual(transform('abc', schema), 'abc');

    // incompatible
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), 123);
  });

  it('assert :: enum (no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.Enum,
      options: [
        {
          value: 123
        },
        {
          value: 'abc'
        }
      ]
    };

    const context = createTransformContext({
      return: false
    });

    deepEqual(transform('123', schema, context), 123);
    deepEqual(transform('abc', schema, context), 'abc');
    deepEqual(transform(123, schema, context), 123);

    deepEqual(transform(true, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });
});
