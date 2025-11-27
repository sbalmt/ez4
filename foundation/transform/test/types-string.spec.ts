import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('string type transformation', () => {
  it('assert :: string', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      nullable: true,
      definitions: {
        trim: true
      }
    };

    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(' def ', schema), 'def');

    deepEqual(transform(true, schema), 'true');
    deepEqual(transform(false, schema), 'false');
    deepEqual(transform(123, schema), '123');

    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: string (default)', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        default: 'foo'
      }
    };

    deepEqual(transform('abc', schema), 'abc');

    // transform
    deepEqual(transform(true, schema), 'true');
    deepEqual(transform(false, schema), 'false');
    deepEqual(transform(123, schema), '123');

    // incompatible
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), 'foo');

    const context = createTransformContext({
      convert: false
    });

    // incompatible
    deepEqual(transform(true, schema, context), true);
    deepEqual(transform(false, schema, context), false);
    deepEqual(transform(123, schema, context), 123);
    deepEqual(transform(null, schema, context), null);

    // default
    deepEqual(transform(undefined, schema, context), 'foo');
  });

  it('assert :: string (no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        trim: true
      }
    };

    const context = createTransformContext({
      return: false
    });

    // compatible
    deepEqual(transform('abc', schema, context), 'abc');
    deepEqual(transform(' def ', schema, context), 'def');

    // transform
    deepEqual(transform(true, schema, context), 'true');
    deepEqual(transform(false, schema, context), 'false');
    deepEqual(transform(123, schema, context), '123');

    // incompatible
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: string (specific and no return)', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        value: 'foo',
        trim: true
      }
    };

    const context = createTransformContext({
      return: false
    });

    // compatible
    deepEqual(transform('foo', schema, context), 'foo');
    deepEqual(transform(' foo ', schema, context), 'foo');

    // incompatible
    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(true, schema, context), undefined);
    deepEqual(transform(false, schema, context), undefined);
    deepEqual(transform(123, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });
});
