import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('union type transformation', () => {
  it('assert :: union', () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      nullable: true,
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

    deepEqual(transform('abc', schema), 'abc');
    deepEqual(transform('false', schema), false);
    deepEqual(transform('123', schema), 123);

    deepEqual(transform(true, schema), true);
    deepEqual(transform(456, schema), 456);

    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: union (no return)', () => {
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

    const context = createTransformContext({
      return: false
    });

    deepEqual(transform('abc', schema, context), 'abc');
    deepEqual(transform('true', schema, context), true);
    deepEqual(transform('123', schema, context), 123);

    deepEqual(transform(false, schema, context), false);
    deepEqual(transform(456, schema, context), 456);

    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
  });

  it('assert :: union (similar types)', () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          properties: {
            foo: {
              type: SchemaType.String
            }
          }
        },
        {
          type: SchemaType.Object,
          properties: {
            foo: {
              type: SchemaType.String
            },
            bar: {
              type: SchemaType.Number
            }
          }
        },
        {
          type: SchemaType.Array,
          element: {
            type: SchemaType.Number
          }
        },
        {
          type: SchemaType.Tuple,
          elements: [
            {
              type: SchemaType.Number
            },
            {
              type: SchemaType.Number
            },
            {
              type: SchemaType.String
            }
          ]
        }
      ]
    };

    // Best fit object
    deepEqual(transform({ foo: 'abc', bar: '123' }, schema), { foo: 'abc', bar: 123 });
    deepEqual(transform({ foo: 'abc' }, schema), { foo: 'abc' });

    // Best fit array
    deepEqual(transform(['123', 456], schema), [123, 456]);
    deepEqual(transform('123', schema), [123]);

    // Best fit tuple
    deepEqual(transform(['123', 456, 'abc'], schema), [123, 456, 'abc']);
    deepEqual(transform('789, 012, def', schema), [789, 12, 'def']);
  });

  it('assert :: union (type collision)', () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      elements: [
        {
          type: SchemaType.Object,
          properties: {
            foo: {
              type: SchemaType.String,
              definitions: {
                value: 'foo-1'
              }
            },
            bar: {
              type: SchemaType.Number
            },
            baz: {
              type: SchemaType.Number
            }
          }
        },
        {
          type: SchemaType.Object,
          properties: {
            foo: {
              type: SchemaType.String,
              definitions: {
                value: 'foo-2'
              }
            },
            bar: {
              type: SchemaType.Number
            }
          }
        }
      ]
    };

    const input = {
      foo: 'foo-2',
      bar: '123',
      baz: '456'
    };

    deepEqual(transform(input, schema), {
      foo: 'foo-2',
      bar: 123
    });
  });
});
