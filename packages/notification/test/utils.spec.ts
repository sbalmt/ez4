import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert';

import { getJsonMessage, getJsonStringMessage } from '@ez4/notification/utils';
import { SchemaType } from '@ez4/schema';

describe('notification utils', () => {
  it('assert :: get json message', async () => {
    const messageSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const messageInput = {
      fooKey: 'foo',

      // Ignored properties
      barKey: 'bar'
    };

    const outputOutput = await getJsonMessage(messageInput, messageSchema);

    deepEqual(outputOutput, {
      fooKey: 'foo'
    });
  });

  it('assert :: get json message (string)', async () => {
    const messageSchema: ObjectSchema = {
      type: SchemaType.Object,
      properties: {
        fooKey: {
          type: SchemaType.String
        }
      }
    };

    const messageInput = {
      fooKey: 'foo'
    };

    const outputOutput = await getJsonStringMessage(messageInput, messageSchema);

    deepEqual(outputOutput, JSON.stringify(messageInput));
  });
});
