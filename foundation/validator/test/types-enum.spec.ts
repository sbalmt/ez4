import type { AnySchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { UnexpectedEnumValueError } from '@ez4/validator';
import { validate } from '@ez4/validator';

import { assertError } from './common';

describe('enum type validation', () => {
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

  it('assert :: enum errors', async () => {
    const schema: AnySchema = {
      type: SchemaType.Enum,
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
