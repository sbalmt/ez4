import { rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { QueueTester } from '@ez4/local-queue';

describe('hello aws queue', () => {
  it('send message with success', async () => {
    const result = QueueTester.getClient('Sqs');

    // Ignore 'bar' since it's not in message schema.
    await result.sendMessage(
      {
        foo: 'abc',
        bar: 'def'
      },
      {
        delay: 0 // Don't need to wait for tests.
      }
    );
  });

  it('send message with failure', async () => {
    const result = QueueTester.getClient('Sqs');

    // Rejects the message since it doesn't pass schema validation.
    await rejects(() =>
      result.sendMessage({
        bar: 'def'
      })
    );
  });

  it('send message with success (fifo)', async () => {
    const result = QueueTester.getClient('FifoSqs');

    // Ignore 'bar' since it's not in message schema.
    await result.sendMessage({
      foo: 'abc',
      bar: 'def'
    });
  });

  it('send message with failure (fifo)', async () => {
    const result = QueueTester.getClient('FifoSqs');

    // Rejects the message since it doesn't pass schema validation.
    await rejects(() =>
      result.sendMessage({
        bar: 'def'
      })
    );
  });
});
