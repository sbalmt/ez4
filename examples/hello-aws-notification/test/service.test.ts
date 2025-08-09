import { rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NotificationTester } from '@ez4/local-notification';

describe('hello aws notification', () => {
  it('send message with success', async () => {
    const result = NotificationTester.getClient('Sns');

    // Ignore 'bar' since it's not in message schema.
    await result.sendMessage({
      foo: 'abc',
      bar: 'def'
    });
  });

  it('send message with failure', async () => {
    const result = NotificationTester.getClient('Sns');

    // Rejects the message since it doesn't pass schema validation.
    await rejects(() =>
      result.sendMessage({
        bar: 'def'
      })
    );
  });

  it('send message with success (fifo)', async () => {
    const result = NotificationTester.getClient('FifoSns');

    // Ignore 'bar' since it's not in message schema.
    await result.sendMessage({
      foo: 'abc',
      bar: 'def'
    });
  });

  it('send message with failure (fifo)', async () => {
    const result = NotificationTester.getClient('FifoSns');

    // Rejects the message since it doesn't pass schema validation.
    await rejects(() =>
      result.sendMessage({
        bar: 'def'
      })
    );
  });
});
