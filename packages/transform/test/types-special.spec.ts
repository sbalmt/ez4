import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { transform } from '@ez4/transform';

describe('special types transform', () => {
  it('assert :: object with extensible properties', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        foo: {
          type: SchemaType.Number
        }
      }
    };

    const output = {
      foo: 123,
      bar: 'abc',
      baz: 'def'
    };

    deepEqual(transform({ foo: '123', bar: 'abc', baz: 'def' }, schema), output);
  });

  it('assert :: object with additional properties', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.String
        }
      },
      additional: {
        property: {
          type: SchemaType.String
        },
        value: {
          type: SchemaType.Number
        }
      }
    };

    const output = {
      foo: 'abc',
      bar: 123
    };

    deepEqual(transform({ foo: 'abc', bar: '123', baz: 'def' }, schema), output);
  });

  it('assert :: object with extensible and additional properties', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      definitions: {
        extensible: true
      },
      properties: {
        foo: {
          type: SchemaType.Boolean
        }
      },
      additional: {
        property: {
          type: SchemaType.String
        },
        value: {
          type: SchemaType.Number
        }
      }
    };

    const output = {
      foo: true,
      bar: 123,
      baz: 'def'
    };

    deepEqual(transform({ foo: 'true', bar: 123, baz: 'def' }, schema), output);
  });

  it('assert :: array from string', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform('123, 4.56', schema), [123, 4.56]);
  });

  it('assert :: tuple from string', () => {
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
