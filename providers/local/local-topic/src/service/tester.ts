import type { Client, Topic } from '@ez4/topic';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace TopicTester {
  export type ClientMock<T extends Topic.Service<any, any>> = Client<T['schema']> & {
    sendMessage: Mock<Client<T['schema']>['sendMessage']>;
  };

  export const getClient = <T extends Topic.Service<any, any>>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Topic.Service<any, any> = any>(resourceName: string) => {
    const client = createClientMock(resourceName) as ClientMock<T>;

    mock.method(client, 'sendMessage');

    return client;
  };

  export const setClientMock = <T extends Topic.Service<any, any>>(resourceName: string) => {
    Tester.mockServiceClient(resourceName, getClientMock<T>(resourceName));
  };

  export const restoreClient = (resourceName: string) => {
    Tester.restoreServiceClient(resourceName);
  };
}
