import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createTransformContext, transform } from '@ez4/transform';
import { SchemaType } from '@ez4/schema';

describe('type transformation', () => {
  it('assert :: reference', () => {
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

    const input = {
      value: '123',
      next: {
        value: '456',
        next: {
          value: '789'
        }
      }
    };

    const output = {
      value: 123,
      next: {
        value: 456,
        next: {
          value: 789
        }
      }
    };

    deepEqual(transform(input, schema), output);
  });

  it('assert :: reference (no return)', () => {
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

    const input = {
      value: '123',
      next: {
        value: '456',
        next: {
          value: '789'
        }
      }
    };

    const output = {
      value: 123,
      next: {
        value: 456,
        next: {
          value: 789
        }
      }
    };

    const context = createTransformContext({
      return: false
    });

    deepEqual(transform(input, schema, context), output);
  });
});
