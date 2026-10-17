import type { EmulateServiceContext } from '@ez4/project/library';
import type { AnyObject } from '@ez4/utils';

import { deepEqual, equal } from 'node:assert/strict';
import { describe, it, mock } from 'node:test';

import { TopicSubscriptionType } from '@ez4/topic/library';
import { Logger } from '@ez4/logger';

import { processQueueEvent } from '../src/handlers/queue';

describe('topic queue forwarding', () => {
  const sendMessage = mock.fn(async (_message: AnyObject) => {});
  const makeService = mock.fn(async (_resourceName: string) => ({ sendMessage }));
  const context: EmulateServiceContext = {
    makeService,
    makeReferences: () => ({}),
    makeDescriptors: () => ({})
  };

  it('assert :: awaits the descriptor client and sends the topic event', async () => {
    const event = { value: 'message' };

    await processQueueEvent(context, { type: TopicSubscriptionType.Queue, service: 'Queue' }, event);

    deepEqual(makeService.mock.calls[0].arguments, ['Queue']);
    deepEqual(sendMessage.mock.calls[0].arguments, [event]);
  });

  it('assert :: logs client loading failures without rejecting forwarding', async () => {
    const failure = new Error('Client loading failed.');
    const previousCount = sendMessage.mock.callCount();
    const error = mock.method(Logger, 'error', () => {});
    const getClient = mock.method(context, 'makeService', async () => {
      throw failure;
    });

    try {
      await processQueueEvent(context, { type: TopicSubscriptionType.Queue, service: 'Queue' }, {});

      deepEqual(error.mock.calls[0].arguments, [String(failure)]);
      equal(sendMessage.mock.callCount(), previousCount);
    } finally {
      getClient.mock.restore();
      error.mock.restore();
    }
  });

  it('assert :: logs send failures without rejecting forwarding', async () => {
    const failure = new Error('Send failed.');
    const error = mock.method(Logger, 'error', () => {});
    const send = mock.method(context, 'makeService', async () => ({
      sendMessage: async () => {
        throw failure;
      }
    }));

    try {
      await processQueueEvent(context, { type: TopicSubscriptionType.Queue, service: 'Queue' }, {});

      deepEqual(error.mock.calls[0].arguments, [String(failure)]);
    } finally {
      send.mock.restore();
      error.mock.restore();
    }
  });
});
