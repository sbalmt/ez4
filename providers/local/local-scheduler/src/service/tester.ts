import type { Client, Cron } from '@ez4/scheduler';
import type { Mock } from 'node:test';
import type { ClientMockSchedules } from '../client/mock';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createClientMock } from '../client/mock';

export namespace CronTester {
  export type MockSchedules<T extends Cron.Event> = ClientMockSchedules<T>;

  export type ClientMock<T extends Cron.Event> = Client<T> & {
    getEvent: Mock<Client<T>['getEvent']>;
    createEvent: Mock<Client<T>['createEvent']>;
    updateEvent: Mock<Client<T>['updateEvent']>;
    deleteEvent: Mock<Client<T>['deleteEvent']>;
  };

  export const getClient = <T extends Cron.Event>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = <T extends Cron.Event = any>(resourceName: string, schedules?: MockSchedules<T>) => {
    const client = createClientMock(resourceName, schedules) as ClientMock<T>;

    mock.method(client, 'getEvent');
    mock.method(client, 'createEvent');
    mock.method(client, 'updateEvent');
    mock.method(client, 'deleteEvent');

    return client;
  };
}
