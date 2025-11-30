import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('number type transformation', () => {
  it('assert :: number', () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      nullable: true
    };

    deepEqual(transform('123', schema), 123);
    deepEqual(transform('4.56', schema), 4.56);

    deepEqual(transform(789, schema), 789);

    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(false, schema), false);
    deepEqual(transform(true, schema), true);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: number (default)', () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        default: 789
      }
    };

    // transform
    deepEqual(transform('123', schema), 123);
    deepEqual(transform('4.56', schema), 4.56);

    // incompatible
    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(false, schema), false);
    deepEqual(transform(true, schema), true);
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), 789);
  });

  it('assert :: number (no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.Number
    };

    const context = createTransformContext({
      return: false
    });

    deepEqual(transform('123', schema, context), 123);
    deepEqual(transform('4.56', schema, context), 4.56);

    deepEqual(transform(789, schema, context), 789);

    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(false, schema, context), undefined);
    deepEqual(transform(true, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: number (specific and no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        value: 123
      }
    };

    const context = createTransformContext({
      return: false
    });

    // compatible
    deepEqual(transform(123, schema, context), 123);

    // transform
    deepEqual(transform('123', schema, context), 123);

    // incompatible
    deepEqual(transform('4.56', schema, context), undefined);
    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(false, schema, context), undefined);
    deepEqual(transform(true, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });
});
