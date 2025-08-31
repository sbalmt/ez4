import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { createTransformContext, transform } from '@ez4/transform';

describe('default type transformation', () => {
  it('assert :: boolean', () => {
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

  it('assert :: number', () => {
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

  it('assert :: string', () => {
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

    // transform
    deepEqual(transform({ foo: 'true', bar: '123', baz: 'abc' }, schema), output);

    // incompatible
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), output);
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

    // transform
    deepEqual(transform(['123', '4.56'], schema), [123, 4.56]);

    // incompatible
    deepEqual(transform(['7.89', 'abc'], schema), [7.89, 'abc']);
    deepEqual(transform(123, schema), 123);
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), [789, 10.1]);
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

    // transform
    deepEqual(transform(['123', 'abc'], schema), [123, 'abc']);

    // incompatible
    deepEqual(transform(['true', '4.56'], schema), ['true', '4.56']);
    deepEqual(transform(123, schema), 123);
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), [456, 'def']);
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

    // transform
    deepEqual(transform('123', schema), 123);
    deepEqual(transform('abc', schema), 'abc');

    // incompatible
    deepEqual(transform(null, schema), null);

    // default
    deepEqual(transform(undefined, schema), 123);
  });
});
