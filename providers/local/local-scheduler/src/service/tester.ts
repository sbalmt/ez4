import type { Client, Cron } from '@ez4/scheduler';
import type { Mock } from 'node:test';

import { Tester } from '@ez4/project/library';

import { mock } from 'node:test';

import { createMockedClient } from '../client/mock';

export namespace CronTester {
  type ClientMock = Client<any> & {
    getEvent: Mock<Client<any>['getEvent']>;
    createEvent: Mock<Client<any>['createEvent']>;
    updateEvent: Mock<Client<any>['updateEvent']>;
    deleteEvent: Mock<Client<any>['deleteEvent']>;
  };

  export const getClient = <T extends Cron.Event>(resourceName: string) => {
    return Tester.getServiceClient(resourceName) as Client<T>;
  };

  export const getClientMock = (resourceName?: string) => {
    const client = createMockedClient(resourceName ?? 'CronMock');

    mock.method(client, 'getEvent');
    mock.method(client, 'createEvent');
    mock.method(client, 'updateEvent');
    mock.method(client, 'deleteEvent');

    return client as ClientMock;
  };
}
