import { rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { QueueTester } from '@ez4/local-queue/test';

describe('hello local elasticmq', () => {
  it('send message with success', async () => {
    const client = QueueTester.getClient('Sqs');

    await client.sendMessage(
      {
        foo: 'abc',
        bar: 'def'
      },
      {
        delay: 0
      }
    );
  });

  it('send message with failure', async () => {
    const client = QueueTester.getClient('Sqs');

    await rejects(() =>
      client.sendMessage({
        bar: 'def'
      })
    );
  });

  it('send message with success (fifo)', async () => {
    const client = QueueTester.getClient('FifoSqs');

    await client.sendMessage({
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

  it('send message with deduplication (fifo)', async () => {
    const result = QueueTester.getClient('FifoSqsDedup');

    await result.sendMessage({
      foo: 'abc',
      baz: 'dedup-id-1'
    });
  });

  it('send message with failure on dedup (fifo)', async () => {
    const result = QueueTester.getClient('FifoSqsDedup');

    // Rejects the message since it doesn't pass schema validation.
    await rejects(() =>
      result.sendMessage({
        baz: 'dedup-id-2'
      })
    );
  });
});
