import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { UnexpectedPropertiesError, ExpectedNumberTypeError, ExpectedStringTypeError, ExpectedObjectTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('object type validation', () => {
  it('assert :: object', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      optional: true,
      nullable: true,
      properties: {
        foo: {
          type: SchemaType.Boolean
        },
        bar: {
          type: SchemaType.Number,
          optional: true
        },
        baz: {
          type: SchemaType.String,
          nullable: true
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

    equal((await validate({ foo: true, bar: 123, baz: 'abc' }, schema)).length, 0);
    equal((await validate({ foo: false, bar: undefined, baz: 'abc' }, schema)).length, 0);
    equal((await validate({ foo: true, bar: 123, baz: null }, schema)).length, 0);
    equal((await validate({ foo: false, baz: null, qux: 123 }, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: object (circular reference)', async () => {
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

    const value = {
      value: 123,
      next: {
        value: 456,
        next: {
          value: 789
        }
      }
    };

    equal((await validate(value, schema)).length, 0);
  });

  it('assert :: object errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      identity: 1,
      properties: {
        foo: {
          type: SchemaType.Number
        }
      },
      additional: {
        property: {
          type: SchemaType.Number
        },
        value: {
          type: SchemaType.String
        }
      }
    };

    await assertError(null, schema, [ExpectedObjectTypeError]);
    await assertError(undefined, schema, [ExpectedObjectTypeError]);
    await assertError({ foo: 123, bar: 'abc' }, schema, [UnexpectedPropertiesError]);
    await assertError({ bar: 'abc' }, schema, [ExpectedNumberTypeError, UnexpectedPropertiesError]);
    await assertError({ foo: 123, qux: 456 }, schema, [ExpectedStringTypeError, UnexpectedPropertiesError]);
  });
});
