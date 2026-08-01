import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert';

import { getJsonEvent, getJsonStringEvent } from '@ez4/topic/utils';
import { SchemaType } from '@ez4/schema';

describe('topic utils', () => {
  it('assert :: get json event', async () => {
    const eventSchema: ObjectSchema = {
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

    const outputOutput = await getJsonEvent(messageInput, eventSchema);

    deepEqual(outputOutput, {
      fooKey: 'foo'
    });
  });

  it('assert :: get json event (string)', async () => {
    const eventSchema: ObjectSchema = {
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

    const outputOutput = await getJsonStringEvent(messageInput, eventSchema);

    deepEqual(outputOutput, JSON.stringify(messageInput));
  });
});
