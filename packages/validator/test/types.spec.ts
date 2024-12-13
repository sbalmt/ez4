import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { validate } from '@ez4/validator';

describe.only('types validation', () => {
  it('assert :: boolean', async () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean,
      optional: true,
      nullable: true
    };

    equal((await validate(true, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: number', async () => {
    const schema: AnySchema = {
      type: SchemaType.Number,
      optional: true,
      nullable: true
    };

    equal((await validate(123, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: string', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      optional: true,
      nullable: true
    };

    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: object', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
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

  it('assert :: union', async () => {
    const schema: AnySchema = {
      type: SchemaType.Union,
      optional: true,
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

    equal((await validate(true, schema)).length, 0);
    equal((await validate(123, schema)).length, 0);
    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: array', async () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      optional: true,
      nullable: true,
      element: {
        type: SchemaType.Number
      }
    };

    equal((await validate([123, 456], schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: tuple', async () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      optional: true,
      nullable: true,
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    equal((await validate([123, 'abc'], schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: enum', async () => {
    const schema: AnySchema = {
      type: SchemaType.Enum,
      optional: true,
      nullable: true,
      options: [
        {
          value: 123
        },
        {
          value: 'abc'
        }
      ]
    };

    equal((await validate(123, schema)).length, 0);
    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });
});
