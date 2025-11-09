import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { base64Encode } from '@ez4/utils';
import { transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('special type transformation', () => {
  it('assert :: object (extensible properties)', () => {
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

  it('assert :: object (additional properties)', () => {
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
      bar: 123,
      baz: 'def'
    };

    deepEqual(transform({ foo: 'abc', bar: '123', baz: 'def' }, schema), output);
  });

  it('assert :: object (extensible and additional properties)', () => {
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

  it('assert :: object (base64-encoded)', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      definitions: {
        encoded: true
      },
      properties: {
        foo: {
          type: SchemaType.Number
        },
        bar: {
          type: SchemaType.String
        }
      }
    };

    const rawInput = { foo: 123, bar: 'abc' };

    const b64Input = base64Encode(JSON.stringify(rawInput));

    deepEqual(transform(b64Input, schema), rawInput);
    deepEqual(transform(rawInput, schema), b64Input);
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

  it('assert :: array (from string)', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform('123, 4.56', schema), [123, 4.56]);
  });

  it('assert :: array (base64-encoded)', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      definitions: {
        encoded: true
      },
      element: {
        type: SchemaType.Number
      }
    };

    const rawInput = [123, 456];

    const b64Input = base64Encode(JSON.stringify([123, 456]));

    deepEqual(transform(b64Input, schema), rawInput);
    deepEqual(transform(rawInput, schema), b64Input);
  });

  it('assert :: tuple (from string)', () => {
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
