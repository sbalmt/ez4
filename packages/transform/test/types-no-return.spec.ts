import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('type transformation without return', () => {
  const context = createTransformContext({
    return: false
  });

  it('assert :: boolean', () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean
    };

    deepEqual(transform(true, schema, context), true);
    deepEqual(transform(false, schema, context), false);

    deepEqual(transform('false', schema, context), false);
    deepEqual(transform('true', schema, context), true);

    deepEqual(transform(0, schema, context), undefined);
    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: number', () => {
    const schema: AnySchema = {
      type: SchemaType.Number
    };

    deepEqual(transform('123', schema, context), 123);
    deepEqual(transform('4.56', schema, context), 4.56);

    deepEqual(transform(789, schema, context), 789);

    deepEqual(transform('abc', schema, context), undefined);
    deepEqual(transform(false, schema, context), undefined);
    deepEqual(transform(true, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: string', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        trim: true
      }
    };

    deepEqual(transform('abc', schema, context), 'abc');
    deepEqual(transform(' def ', schema, context), 'def');
    deepEqual(transform(true, schema, context), 'true');
    deepEqual(transform(false, schema, context), 'false');
    deepEqual(transform(123, schema, context), '123');

    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: object', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Boolean,
          alias: 'FOO'
        },
        bar: {
          type: SchemaType.Number
        },
        baz: {
          type: SchemaType.String
        }
      }
    };

    const output = {
      FOO: true,
      bar: 123,
      baz: 'abc'
    };

    deepEqual(transform({ foo: 'true', bar: '123', baz: 'abc' }, schema, context), output);

    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: reference', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        value: {
          type: SchemaType.Number
        },
        next: {
          type: SchemaType.Reference,
          identity: 1,
          optional: true
        }
      }
    };

    const input = {
      value: '123',
      next: {
        value: '456',
        next: {
          value: '789'
        }
      }
    };

    const output = {
      value: 123,
      next: {
        value: 456,
        next: {
          value: 789
        }
      }
    };

    deepEqual(transform(input, schema, context), output);
  });

  it('assert :: union', () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Boolean
        },
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    deepEqual(transform('abc', schema, context), 'abc');
    deepEqual(transform('true', schema, context), true);
    deepEqual(transform('123', schema, context), 123);

    deepEqual(transform(false, schema, context), false);
    deepEqual(transform(456, schema, context), 456);

    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: array', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform(['123', '4.56'], schema, context), [123, 4.56]);
    deepEqual(transform([789], schema, context), [789]);

    deepEqual(transform(['7.89', 'abc'], schema, context), [7.89, undefined]);

    deepEqual(transform(123, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: tuple', () => {
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

    deepEqual(transform(['123', 'abc'], schema, context), [123, 'abc']);
    deepEqual(transform([456, 'def'], schema, context), [456, 'def']);

    deepEqual(transform(['true', '4.56'], schema, context), [undefined, '4.56']);

    deepEqual(transform(123, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: enum', () => {
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

    deepEqual(transform('123', schema, context), 123);
    deepEqual(transform('abc', schema, context), 'abc');
    deepEqual(transform(123, schema, context), 123);

    deepEqual(transform(true, schema, context), undefined);
    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });
});
