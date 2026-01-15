import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { base64Encode } from '@ez4/utils';
import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('object type transformation', () => {
  it('assert :: object', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      nullable: true,
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

    deepEqual(transform({ foo: 'true', bar: '123', baz: 'abc' }, schema), output);

    deepEqual(transform(undefined, schema), undefined);
    deepEqual(transform(null, schema), null);
  });

  it('assert :: object (default)', () => {
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

  it('assert :: object (no return)', () => {
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

    const context = createTransformContext({
      return: false
    });

    const output = {
      FOO: true,
      bar: 123,
      baz: 'abc'
    };

    deepEqual(transform({ foo: 'true', bar: '123', baz: 'abc' }, schema, context), output);

    deepEqual(transform(undefined, schema, context), undefined);
    deepEqual(transform(null, schema, context), undefined);
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

  it('assert :: object (extensible)', () => {
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

  it('assert :: object (additional)', () => {
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

  it('assert :: object (extensible and additional)', () => {
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

  it('assert :: object (extensible, additional and preserve)', () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      definitions: {
        extensible: true,
        preserve: true
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
      'foo.bar': 123,
      'foo@baz': 'def'
    };

    deepEqual(transform({ foo: 'true', 'foo.bar': 123, 'foo@baz': 'def' }, schema), output);
  });
});
