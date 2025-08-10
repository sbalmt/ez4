import type { Client, Notification } from '@ez4/notification';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createMockedClient } from '../client/mock.js';

export namespace NotificationTester {
  export type ClientMock = Client<any> & {
    sendMessage: Mock<Client<any>['sendMessage']>;
  };

  export const getClient = <T extends Notification.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = (resourceName?: string) => {
    const client = createMockedClient(resourceName ?? 'TopicMock');

    mock.method(client, 'sendMessage');

    return client as ClientMock;
  };
}
