import type { Client, Queue } from '@ez4/queue';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace QueueTester {
  export type ClientMock<T extends Queue.Message, U extends Queue.Mode> = Client<T, U> & {
    receiveMessage: Mock<Client<T, U>['receiveMessage']>;
    sendMessage: Mock<Client<T, U>['sendMessage']>;
  };

  export type ClientMode<T extends Queue.Service<any, Queue.Mode>> = T extends { fairMode: never }
    ? { fifoMode: true }
    : { fairMode: true };

  export const getClient = <T extends Queue.Service<any, Queue.Mode>>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T['schema'], ClientMode<T>>;
  };

  export const getClientMock = <T extends Queue.Service<any, Queue.Mode>>(resourceName: string) => {
    const client = createClientMock(resourceName) as ClientMock<T['schema'], ClientMode<T>>;

    mock.method(client, 'sendMessage');
    mock.method(client, 'receiveMessage');

    return client;
  };

  export const setClientMock = <T extends Queue.Service<any, Queue.Mode>>(resourceName: string) => {
    Tester.mockServiceClient(resourceName, getClientMock<T>(resourceName));
  };

  export const restoreClient = (resourceName: string) => {
    Tester.restoreServiceClient(resourceName);
  };
}
