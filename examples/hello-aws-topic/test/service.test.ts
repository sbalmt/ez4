import { rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TopicTester } from '@ez4/local-topic/test';

describe('hello aws topic', () => {
  it('publish event with success', async () => {
    const result = TopicTester.getClient('Sns');

    // Ignore 'bar' since it's not in event schema.
    await result.publishEvent({
      foo: 'abc',
      bar: 'def'
    });
  });

  it('publish event with failure', async () => {
    const result = TopicTester.getClient('Sns');

    // Rejects the event since it doesn't pass schema validation.
    await rejects(() =>
      result.publishEvent({
        bar: 'def'
      })
    );
  });

  it('publish event with success (fifo)', async () => {
    const result = TopicTester.getClient('FifoSns');

    // Ignore 'bar' since it's not in event schema.
    await result.publishEvent({
      foo: 'abc',
      bar: 'def'
    });
  });

  it('publish event with failure (fifo)', async () => {
    const result = TopicTester.getClient('FifoSns');

    // Rejects the event since it doesn't pass schema validation.
    await rejects(() =>
      result.publishEvent({
        bar: 'def'
      })
    );
  });
});
