import type { AnySchema, StringSchema } from '@ez4/schema';

import { equal } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { validate, registerStringFormat, UnexpectedFormatError, createValidatorContext } from '@ez4/validator';
import { SchemaType } from '@ez4/schema';

describe('custom types validation', () => {
  it('assert :: custom string format', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'custom'
    };

    const handler = mock.fn((_value: string, _schema: StringSchema, _property?: string) => {
      return [];
    });

    registerStringFormat('custom', handler);

    const allErrors = await validate('abc', schema);

    equal(handler.mock.callCount(), 1);
    equal(allErrors.length, 0);
  });

  it('assert :: custom string format error', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      format: 'custom-with-error'
    };

    const handler = mock.fn((_value: string, _schema: StringSchema, property?: string) => {
      return [new UnexpectedFormatError('string', 'impossible', property)];
    });

    registerStringFormat('custom-with-error', handler);

    const allErrors = await validate('abc', schema);

    equal(handler.mock.callCount(), 1);
    equal(allErrors.length, 1);
  });

  it('assert :: custom validation (through context)', async () => {
    const schema: AnySchema = {
      type: SchemaType.Object,
      properties: {
        foo: {
          type: SchemaType.Array,
          element: {
            type: SchemaType.String,
            definitions: {
              custom: true
            }
          }
        },
        bar: {
          type: SchemaType.Tuple,
          elements: [
            {
              type: SchemaType.Number,
              definitions: {
                custom: true
              }
            }
          ]
        },
        baz: {
          type: SchemaType.Boolean,
          definitions: {
            custom: true
          }
        }
      }
    };

    const handler = mock.fn((_value: unknown, _schema: AnySchema) => {});

    const context = createValidatorContext({
      onCustomValidation: handler
    });

    const input = {
      foo: ['abc'],
      bar: [123],
      baz: true
    };

    const allErrors = await validate(input, schema, context);

    equal(handler.mock.callCount(), 3);
    equal(allErrors.length, 0);
  });

  it('assert :: custom validation error (through context)', async () => {
    const schema: AnySchema = {
      type: SchemaType.String,
      definitions: {
        custom: true
      }
    };

    const handler = mock.fn((_value: unknown, _schema: AnySchema) => {
      throw new Error('This is not valid.');
    });

    const context = createValidatorContext({
      onCustomValidation: handler
    });

    const allErrors = await validate('abc', schema, context);

    equal(handler.mock.callCount(), 1);
    equal(allErrors.length, 1);
  });
});
