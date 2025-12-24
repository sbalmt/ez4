import type { ObjectSchema } from '@ez4/schema';

import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveIdentity } from '@ez4/gateway/utils';
import { HttpBadRequestError } from '@ez4/gateway';
import { SchemaType } from '@ez4/schema';

describe('http identity utils', () => {
  it('assert :: get identity', async () => {
    const identitySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const identityInput = {
      fooKey: 'foo'
    };

    const identityOutput = await resolveIdentity(identityInput, identitySchema);

    deepEqual(identityOutput, {
      fooKey: 'foo'
    });
  });

  it('assert :: get identity (unexpected property)', async () => {
    const identitySchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const identityInput = {
      fooKey: 'foo',
      barKey: 'unexpected'
    };

    await rejects(() => resolveIdentity(identityInput, identitySchema), HttpBadRequestError);
  });
});
