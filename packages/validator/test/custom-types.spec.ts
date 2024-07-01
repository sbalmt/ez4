import type { AnySchema, StringSchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { validate, registerStringFormat, UnexpectedFormatError } from '@ez4/validator';
import { SchemaTypeName } from '@ez4/schema';

describe.only('custom types validation', () => {
  it('assert :: custom format', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'custom'
    };

    const handler = mock.fn((_value: string, _schema: StringSchema, _property?: string) => {
      return [];
    });

    registerStringFormat('custom', handler);

    equal((await validate('abc', schema)).length, 0);
    equal(handler.mock.callCount(), 1);
  });

  it('assert :: custom format error', async () => {
    const schema: AnySchema = {
      type: SchemaTypeName.String,
      format: 'custom-with-error'
    };

    const handler = mock.fn((_value: string, _schema: StringSchema, property?: string) => {
      return [new UnexpectedFormatError('string', 'impossible', property)];
    });

    registerStringFormat('custom-with-error', handler);

    equal((await validate('abc', schema)).length, 1);
    equal(handler.mock.callCount(), 1);
  });
});
