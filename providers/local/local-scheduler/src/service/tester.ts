import type { Client, Cron } from '@ez4/scheduler';
import type { Mock } from 'node:test';
import type { ClientMockOptions } from '../client/mock';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace CronTester {
  export type MockOptions<T extends Cron.Event> = ClientMockOptions<T>;

  export type ClientMock<T extends Cron.Event> = Client<T> & {
    getEvent: Mock<Client<T>['getEvent']>;
    createEvent: Mock<Client<T>['createEvent']>;
    updateEvent: Mock<Client<T>['updateEvent']>;
    deleteEvent: Mock<Client<T>['deleteEvent']>;
  };

  export const getClient = <T extends Cron.Event>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Cron.Event = any>(resourceName: string, options?: MockOptions<T>) => {
    const client = createClientMock(resourceName, options) as ClientMock<T>;

    mock.method(client, 'getEvent');
    mock.method(client, 'createEvent');
    mock.method(client, 'updateEvent');
    mock.method(client, 'deleteEvent');

    return client;
  };
}
