import type { ObjectSchema } from '@ez4/schema';

import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveHeaders } from '@ez4/gateway/utils';
import { HttpBadRequestError } from '@ez4/gateway';
import { SchemaType } from '@ez4/schema';

describe('http headers utils', () => {
  it('assert :: get headers', async () => {
    const headersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        'x-foo-key': {
          type: SchemaType.String
        }
      }
    };

    const headersInput = {
      'x-foo-key': 'foo',

      // Ignored properties
      'x-foo-bar': 'ignored'
    };

    const headersOutput = await resolveHeaders(headersInput, headersSchema);

    deepEqual(headersOutput, {
      'x-foo-key': 'foo'
    });
  });

  it('assert :: get headers (wrong parameter format)', async () => {
    const headersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        'x-foo-key': {
          type: SchemaType.String
        }
      }
    };

    const headersInput = {
      'x-foo-key': 123
    };

    await rejects(() => resolveHeaders(headersInput, headersSchema), HttpBadRequestError);
  });
});
