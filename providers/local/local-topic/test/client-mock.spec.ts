import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TopicTester } from '@ez4/local-topic/test';

type TestMessage = {
  foo: string;
  bar: number;
};

describe('local topic tests', () => {
  it('assert :: send message', async () => {
    const client = TopicTester.getClientMock<TestMessage>('topic');

    await client.sendMessage({
      foo: 'foo',
      bar: 123
    });

    equal(client.sendMessage.mock.callCount(), 1);
  });
});
