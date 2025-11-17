import type { Client, Topic } from '@ez4/topic';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace TopicTester {
  export type ClientMock<T extends Topic.Message> = Client<T> & {
    sendMessage: Mock<Client<T>['sendMessage']>;
  };

  export const getClient = <T extends Topic.Message>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Topic.Message = any>(resourceName: string) => {
    const client = createClientMock(resourceName) as ClientMock<T>;

    mock.method(client, 'sendMessage');

    return client;
  };
}
