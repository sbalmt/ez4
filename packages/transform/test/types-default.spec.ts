import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { createTransformContext, transform } from '@ez4/transform';

describe('default types transform', () => {
  it('assert :: number', () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      definitions: {
        default: 789
      }
    };

    deepEqual(transform('123', schema), 123);
    deepEqual(transform('4.56', schema), 4.56);

    deepEqual(transform('abc', schema), 789);
    deepEqual(transform(false, schema), 789);
    deepEqual(transform(true, schema), 789);
    deepEqual(transform(undefined, schema), 789);
    deepEqual(transform(null, schema), 789);
  });

  it('assert :: string', () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        default: 'foo'
      }
    };

    deepEqual(transform('abc', schema), 'abc');

    // convert enabled
    deepEqual(transform(true, schema), 'true');
    deepEqual(transform(false, schema), 'false');
    deepEqual(transform(123, schema), '123');
    deepEqual(transform(undefined, schema), 'foo');
    deepEqual(transform(null, schema), 'foo');

    // convert disabled
    const context = createTransformContext({
      convert: false
    });

    deepEqual(transform(true, schema, context), 'foo');
    deepEqual(transform(false, schema, context), 'foo');
    deepEqual(transform(123, schema, context), 'foo');
    deepEqual(transform(undefined, schema, context), 'foo');
    deepEqual(transform(null, schema, context), 'foo');
  });

  it('assert :: object', () => {
    const output = { foo: true, bar: 123, baz: 'abc' };

    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      definitions: {
        default: output
      },
      properties: {
        foo: {
          type: SchemaType.Boolean
        },
        bar: {
          type: SchemaType.Number
        },
        baz: {
          type: SchemaType.String
        }
      }
    };

    deepEqual(transform({ foo: 'true', bar: '123', baz: 'abc' }, schema), output);

    deepEqual(transform(undefined, schema), output);
    deepEqual(transform(null, schema), output);
  });

  it('assert :: array', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      definitions: {
        default: [789, 10.1]
      },
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform(['123', '4.56'], schema), [123, 4.56]);

    deepEqual(transform(['7.89', 'abc'], schema), [7.89, undefined]);

    deepEqual(transform(123, schema), [789, 10.1]);
    deepEqual(transform(undefined, schema), [789, 10.1]);
    deepEqual(transform(null, schema), [789, 10.1]);
  });

  it('assert :: tuple', () => {
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

    deepEqual(transform(['123', 'abc'], schema), [123, 'abc']);

    deepEqual(transform(['true', '4.56'], schema), [undefined, '4.56']);

    deepEqual(transform(123, schema), [456, 'def']);
    deepEqual(transform(undefined, schema), [456, 'def']);
    deepEqual(transform(null, schema), [456, 'def']);
  });

  it('assert :: enum', () => {
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

    deepEqual(transform('123', schema), 123);
    deepEqual(transform('abc', schema), 'abc');

    deepEqual(transform(undefined, schema), 123);
    deepEqual(transform(null, schema), 123);
  });
});
