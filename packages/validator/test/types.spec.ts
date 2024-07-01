import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaTypeName } from '@ez4/schema';
import { validate } from '@ez4/validator';

describe.only('types validation', () => {
  it('assert :: boolean', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Boolean,
      optional: true,
      nullable: true
    };

    equal((await validate(true, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: number', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number,
      optional: true,
      nullable: true
    };

    equal((await validate(123, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: string', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      optional: true,
      nullable: true
    };

    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: object', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Object,
      optional: true,
      nullable: true,
      properties: {
        foo: {
          type: SchemaTypeName.Boolean
        },
        bar: {
          type: SchemaTypeName.Number,
          optional: true
        },
        baz: {
          type: SchemaTypeName.String,
          nullable: true
        }
      }
    };

    equal((await validate({ foo: true, bar: 123, baz: 'abc' }, schema)).length, 0);
    equal((await validate({ foo: false, bar: undefined, baz: 'abc' }, schema)).length, 0);
    equal((await validate({ foo: true, bar: 123, baz: null }, schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: union', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Union,
      optional: true,
      nullable: true,
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

    equal((await validate(true, schema)).length, 0);
    equal((await validate(123, schema)).length, 0);
    equal((await validate('abc', schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: array', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Array,
      optional: true,
      nullable: true,
      element: {
        type: SchemaTypeName.Number
      }
    };

    equal((await validate([123, 456], schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: tuple', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Tuple,
      optional: true,
      nullable: true,
      elements: [
        {
          type: SchemaTypeName.Number
        },
        {
          type: SchemaTypeName.String
        }
      ]
    };

    equal((await validate([123, 'abc'], schema)).length, 0);
    equal((await validate(undefined, schema)).length, 0);
    equal((await validate(null, schema)).length, 0);
  });

  it('assert :: enum', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Enum,
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
