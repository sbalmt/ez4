import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('boolean type transformation', () => {
  it('assert :: boolean', () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean,
      nullable: true
    };

    // compatible
    deepEqual(transform(true, schema), true);
    deepEqual(transform(false, schema), false);

    // transform
    deepEqual(transform('false', schema), false);
    deepEqual(transform('true', schema), true);

    // incompatible
    deepEqual(transform(0, schema), 0);
    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: boolean (default)', () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean,
      definitions: {
        default: true
      }
    };

    // transform
    deepEqual(transform('false', schema), false);
    deepEqual(transform('true', schema), true);

    // incompatible
    deepEqual(transform(0, schema), 0);
    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), true);
  });

  it('assert :: boolean (no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean
    };

    const context = createTransformContext({
      return: false
    });

    // compatible
    deepEqual(transform(true, schema, context), true);
    deepEqual(transform(false, schema, context), false);

    // transform
    deepEqual(transform('false', schema, context), false);
    deepEqual(transform('true', schema, context), true);

    // incompatible
    deepEqual(transform(0, schema, context), undefined);
    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: boolean (specific and no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean,
      definitions: {
        value: true
      }
    };

    const context = createTransformContext({
      return: false
    });

    // compatible
    deepEqual(transform(true, schema, context), true);

    // transform
    deepEqual(transform('true', schema, context), true);

    // incompatible
    deepEqual(transform(0, schema, context), undefined);
    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
    deepEqual(transform('false', schema, context), undefined);
    deepEqual(transform(false, schema, context), undefined);
  });
});
