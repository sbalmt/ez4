import type { Client, Topic } from '@ez4/topic';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createMockClient } from '../client/mock';

export namespace TopicTester {
  export type ClientMock = Client<any> & {
    sendMessage: Mock<Client<any>['sendMessage']>;
  };

  export const getClient = <T extends Topic.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = (resourceName?: string) => {
    const client = createMockClient(resourceName ?? 'TopicMock');

    mock.method(client, 'sendMessage');

    return client as ClientMock;
  };
}
