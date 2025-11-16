import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { QueueTester } from '@ez4/local-queue/test';

type TestMessage = {
  foo: string;
  bar: number;
};

describe('local queue tests', () => {
  it('assert :: send message', async () => {
    const client = QueueTester.getClientMock<TestMessage>('queue');

    await client.sendMessage({
      foo: 'foo',
      bar: 123
    });

    equal(client.sendMessage.mock.callCount(), 1);
  });
});
