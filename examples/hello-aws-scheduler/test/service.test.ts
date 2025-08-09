import { rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CronTester } from '@ez4/local-scheduler';

describe('hello aws scheduler', () => {
  it('create dynamic event with success', async () => {
    const client = CronTester.getClient('DynamicCron');

    await client.createEvent('test', {
      date: new Date(Date.now() + 5000),
      // Ignore 'bar' since it's not in message schema.
      event: {
        foo: 'abc',
        bar: 'def'
      }
    });
  });

  it('create dynamic event with failure', async () => {
    const client = CronTester.getClient('DynamicCron');

    // Rejects the event since it doesn't pass schema validation.
    await rejects(() =>
      client.createEvent('test', {
        date: new Date(Date.now() + 5000),
        event: {
          bar: 'abc'
        }
      })
    );
  });
});
