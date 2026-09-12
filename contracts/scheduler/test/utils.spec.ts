import type { ObjectSchema } from '@ez4/schema';

import { describe, it } from 'node:test';
import { deepEqual } from 'node:assert/strict';

import { MalformedEventError, getJsonEvent, getJsonStringEvent } from '@ez4/scheduler/utils';
import { SchemaType } from '@ez4/schema';

describe('scheduler event utils', () => {
  const eventSchema: ObjectSchema = {
    type: SchemaType.Object,
    properties: {
      fooKey: {
        type: SchemaType.String
      }
    }
  };

  it('assert :: get json event', async () => {
    const event = await getJsonEvent(
      {
        fooKey: 'foo',
        barKey: 'bar'
      },
      eventSchema
    );

    deepEqual(event, {
      fooKey: 'foo'
    });
  });

  it('assert :: get json event string', async () => {
    const event = await getJsonStringEvent(
      {
        fooKey: 'foo',
        barKey: 'bar'
      },
      eventSchema
    );

    deepEqual(event, JSON.stringify({ fooKey: 'foo' }));
  });

  it('assert :: reject malformed json event', async ({ assert }) => {
    await assert.rejects(() => getJsonEvent({}, eventSchema), MalformedEventError);
    await assert.rejects(() => getJsonEvent({ fooKey: 123 }, eventSchema), MalformedEventError);
  });
});
