import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { rejects } from 'node:assert';

import { getJsonMessage, MalformedMessageError } from '@ez4/queue/utils';
import { SchemaType } from '@ez4/schema';

describe('queue utils errors', () => {
  it('assert :: get json message (unexpected property)', async () => {
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
      barKey: 'unexpected'
    };

    await rejects(() => getJsonMessage(messageInput, messageSchema), MalformedMessageError);
  });
});
