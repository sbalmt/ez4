import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { createValidatorContext, ExpectedBooleanTypeError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('boolean type validation', () => {
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

  it('assert :: boolean (default)', async () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean,
      definitions: {
        default: false
      }
    };

    equal((await validate(undefined, schema)).length, 0);
  });

  it('assert :: boolean (cast)', async () => {
    const context = createValidatorContext({ cast: true });

    const schema: AnySchema = {
      type: SchemaType.Boolean
    };

    equal((await validate('true', schema, context)).length, 0);
    equal((await validate('false', schema, context)).length, 0);
  });

  it('assert :: boolean errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Boolean
    };

    await assertError(null, schema, [ExpectedBooleanTypeError]);
    await assertError(undefined, schema, [ExpectedBooleanTypeError]);
    await assertError('true', schema, [ExpectedBooleanTypeError]);
    await assertError('false', schema, [ExpectedBooleanTypeError]);
    await assertError(1, schema, [ExpectedBooleanTypeError]);
    await assertError(0, schema, [ExpectedBooleanTypeError]);
  });
});
