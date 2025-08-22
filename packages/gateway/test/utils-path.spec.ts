import type { ObjectSchema } from '@ez4/schema';

import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getPathParameters } from '@ez4/gateway/utils';
import { HttpBadRequestError } from '@ez4/gateway';
import { SchemaType } from '@ez4/schema';

describe('http path utils', () => {
  it('assert :: get path parameters', async () => {
    const parametersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const parametersInput = {
      fooKey: 'foo',

      // Ignored properties
      fooBar: 'ignored'
    };

    const parametersOutput = await getPathParameters(parametersInput, parametersSchema);

    deepEqual(parametersOutput, {
      fooKey: 'foo'
    });
  });

  it('assert :: get path parameters (wrong parameter format)', async () => {
    const parametersSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const parametersInput = {
      fooKey: 123
    };

    await rejects(() => getPathParameters(parametersInput, parametersSchema), HttpBadRequestError);
  });
});
