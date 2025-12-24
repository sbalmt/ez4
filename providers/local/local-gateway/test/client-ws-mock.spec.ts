import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WsTester } from '@ez4/local-gateway/test';

type Message = {
  foo: string;
  bar: number;
};

describe('local ws gateway tests', () => {
  it('assert :: send message', async () => {
    const client = WsTester.getClientMock<Message>('ws');

    await client.sendMessage('connection-id', {
      foo: 'foo',
      bar: 123
    });

    equal(client.sendMessage.mock.callCount(), 1);
  });

  it('assert :: disconnect', async () => {
    const client = WsTester.getClientMock<Message>('ws');

    await client.disconnect('connection-id');

    equal(client.disconnect.mock.callCount(), 1);
  });
});
