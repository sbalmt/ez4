import type { AnySchema } from '@ez4/schema';

import { describe, it } from 'node:test';

import {
  UnexpectedPropertiesError,
  UnexpectedEnumValueError,
  ExpectedBooleanTypeError,
  ExpectedNumberTypeError,
  ExpectedStringTypeError,
  ExpectedObjectTypeError,
  ExpectedArrayTypeError,
  ExpectedTupleTypeError
} from '@ez4/validator';

import { SchemaTypeName } from '@ez4/schema';

import { assertError } from './common.js';

describe.only('type validation errors', () => {
  it('assert :: boolean errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Boolean
    };

    await assertError(null, schema, [ExpectedBooleanTypeError]);
    await assertError(undefined, schema, [ExpectedBooleanTypeError]);
    await assertError(1, schema, [ExpectedBooleanTypeError]);
    await assertError(0, schema, [ExpectedBooleanTypeError]);
  });

  it('assert :: number errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Number
    };

    await assertError(null, schema, [ExpectedNumberTypeError]);
    await assertError(undefined, schema, [ExpectedNumberTypeError]);
    await assertError(NaN, schema, [ExpectedNumberTypeError]);
    await assertError('123', schema, [ExpectedNumberTypeError]);
  });

  it('assert :: string errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String
    };

    await assertError(null, schema, [ExpectedStringTypeError]);
    await assertError(undefined, schema, [ExpectedStringTypeError]);
    await assertError(123, schema, [ExpectedStringTypeError]);
  });

  it('assert :: object errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Object,
      properties: {
        foo: {
          type: SchemaTypeName.Number
        }
      }
    };

    await assertError(null, schema, [ExpectedObjectTypeError]);
    await assertError(undefined, schema, [ExpectedObjectTypeError]);
    await assertError({ foo: 123, bar: 'abc' }, schema, [UnexpectedPropertiesError]);
    await assertError({ bar: 'abc' }, schema, [ExpectedNumberTypeError, UnexpectedPropertiesError]);
  });

  it('assert :: union errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Union,
      elements: [
        {
          type: SchemaTypeName.Object,
          properties: {
            foo: {
              type: SchemaTypeName.String
            },
            bar: {
              type: SchemaTypeName.String
            }
          }
        },
        {
          type: SchemaTypeName.Object,
          properties: {
            baz: {
              type: SchemaTypeName.Number
            },
            qux: {
              type: SchemaTypeName.Number
            }
          }
        }
      ]
    };

    // No matching objects
    await assertError(null, schema, [ExpectedObjectTypeError, ExpectedObjectTypeError]);
    await assertError(undefined, schema, [ExpectedObjectTypeError, ExpectedObjectTypeError]);

    // First matching object properties only.
    await assertError({ foo: 123 }, schema, [ExpectedStringTypeError, ExpectedStringTypeError]);
  });

  it('assert :: array errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Array,
      element: {
        type: SchemaTypeName.String
      }
    };

    await assertError(null, schema, [ExpectedArrayTypeError]);
    await assertError(undefined, schema, [ExpectedArrayTypeError]);

    await assertError(['abc', 123, true], schema, [
      ExpectedStringTypeError,
      ExpectedStringTypeError
    ]);
  });

  it('assert :: tuple errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Tuple,
      elements: [
        {
          type: SchemaTypeName.Number
        },
        {
          type: SchemaTypeName.Number
        },
        {
          type: SchemaTypeName.String
        }
      ]
    };

    await assertError(null, schema, [ExpectedTupleTypeError]);
    await assertError(undefined, schema, [ExpectedTupleTypeError]);
    await assertError([123, false], schema, [ExpectedNumberTypeError, ExpectedStringTypeError]);
  });

  it('assert :: enum errors', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.Enum,
      options: [
        {
          value: 'abc'
        },
        {
          value: 123
        }
      ]
    };

    await assertError(null, schema, [UnexpectedEnumValueError]);
    await assertError(undefined, schema, [UnexpectedEnumValueError]);
    await assertError({}, schema, [UnexpectedEnumValueError]);
  });
});
