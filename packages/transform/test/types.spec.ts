import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaTypeName } from '@ez4/schema';
import { transform } from '@ez4/transform';

describe.only('types transform', () => {
  it('assert :: boolean', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Boolean
    };

    deepEqual(transform(true, schema), true);
    deepEqual(transform('true', schema), true);
    deepEqual(transform('false', schema), false);
    deepEqual(transform('abc', schema), undefined);
    deepEqual(transform(0, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: number', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number
    };

    deepEqual(transform('123', schema), 123);
    deepEqual(transform('4.56', schema), 4.56);
    deepEqual(transform('abc', schema), undefined);
    deepEqual(transform(false, schema), undefined);
    deepEqual(transform(true, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: string', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String
    };

    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform(true, schema), undefined);
    deepEqual(transform(false, schema), undefined);
    deepEqual(transform(123, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: object', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Object,
      properties: {
        foo: {
          type: SchemaTypeName.Boolean
        },
        bar: {
          type: SchemaTypeName.Number
        },
        baz: {
          type: SchemaTypeName.String
        }
      }
    };

    const input = { foo: 'true', bar: '123', baz: 'abc' };
    const output = { foo: true, bar: 123, baz: 'abc' };

    deepEqual(transform(input, schema), output);
    deepEqual(transform(null, schema), null);
    deepEqual(transform(undefined, schema), undefined);
  });

  it('assert :: union', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Union,
      elements: [
        {
          type: SchemaTypeName.Boolean
        },
        {
          type: SchemaTypeName.Number
        },
        {
          type: SchemaTypeName.String
        }
      ]
    };

    deepEqual(transform('false', schema), false);
    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform('123', schema), 123);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: array', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Array,
      element: {
        type: SchemaTypeName.Number
      }
    };

    deepEqual(transform(['123', '4.56'], schema), [123, 4.56]);
    deepEqual(transform(['7.89', 'abc'], schema), [7.89, undefined]);
    deepEqual(transform(123, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: tuple', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Tuple,
      elements: [
        {
          type: SchemaTypeName.Number
        },
        {
          type: SchemaTypeName.String
        }
      ]
    };

    deepEqual(transform(['123', 'abc'], schema), [123, 'abc']);
    deepEqual(transform(['true', '4.56'], schema), [undefined, '4.56']);
    deepEqual(transform(123, schema), undefined);
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: enum', () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Enum,
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
    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });
});
