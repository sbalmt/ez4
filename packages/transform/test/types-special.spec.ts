import type { AnySchema } from '@ez4/schema';

import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SchemaType } from '@ez4/schema';
import { transform } from '@ez4/transform';

describe('special types transform', () => {
  it('assert :: array from string', () => {
    const schema: AnySchema = {
      type: SchemaType.Array,
      element: {
        type: SchemaType.Number
      }
    };

    deepEqual(transform('123, 4.56', schema), [123, 4.56]);
  });

  it('assert :: tuple from string', () => {
    const schema: AnySchema = {
      type: SchemaType.Tuple,
      elements: [
        {
          type: SchemaType.Number
        },
        {
          type: SchemaType.String
        }
      ]
    };

    deepEqual(transform('123, abc', schema), [123, 'abc']);
  });
});
