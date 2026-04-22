import type { Queue } from '@ez4/queue';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { QueueTester } from '@ez4/local-queue/test';

type TestMessage = {
  foo: string;
  bar: number;
};

export declare class TestUnorderedQueue extends Queue.Unordered<TestMessage> {
  subscriptions: [];

  fairMode: Queue.UseFairMode<{
    groupId: 'bar';
  }>;
}

export declare class TestOrderedQueue extends Queue.Ordered<TestMessage> {
  subscriptions: [];

  fifoMode: Queue.UseFifoMode<{
    groupId: 'foo';
  }>;
}

describe('local queue tests', () => {
  it('assert :: send message (unordered queue)', async () => {
    const client = QueueTester.getClientMock<TestUnorderedQueue>('queue');

    await client.sendMessage(
      {
        foo: 'foo',
        bar: 123
      },
      {
        delay: 100
      }
    );

    equal(client.sendMessage.mock.callCount(), 1);
  });

  it('assert :: send message (ordered queue)', async () => {
    const client = QueueTester.getClientMock<TestOrderedQueue>('queue');

    await client.sendMessage({
      foo: 'foo',
      bar: 123
    });

    equal(client.sendMessage.mock.callCount(), 1);
  });
});
