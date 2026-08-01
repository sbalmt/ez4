import type { Topic } from '@ez4/topic';

import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TopicTester } from '@ez4/local-topic/test';

type TestMessage = {
  foo: string;
  bar: number;
};

export declare class TestUnorderedTopic extends Topic.Unordered<TestMessage> {
  subscriptions: [];
}

export declare class TestOrderedTopic extends Topic.Ordered<TestMessage> {
  subscriptions: [];

  fifoMode: {
    groupId: 'foo';
  };
}

describe('local topic tests', () => {
  it('assert :: publish event (unordered topic)', async () => {
    const client = TopicTester.getClientMock<TestUnorderedTopic>('topic');

    await client.publishEvent({
      foo: 'foo',
      bar: 123
    });

    equal(client.publishEvent.mock.callCount(), 1);
  });

  it('assert :: publish event (ordered topic)', async () => {
    const client = TopicTester.getClientMock<TestOrderedTopic>('topic');

    await client.publishEvent({
      foo: 'foo',
      bar: 123
    });

    equal(client.publishEvent.mock.callCount(), 1);
  });
});
