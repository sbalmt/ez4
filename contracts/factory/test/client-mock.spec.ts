import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FactoryTester } from '@ez4/factory/test';

type TestService = {
  helloWorld(): string;
};

describe('factory client mock tests', async () => {
  const getServiceMock = (): TestService => {
    return {
      helloWorld: () => 'success'
    };
  };

  it('assert :: get instance mock', () => {
    const client = FactoryTester.getClientMock<TestService>('TestService', {
      handler: getServiceMock
    });

    equal(client.helloWorld(), 'success');
  });

  it('assert :: global instance mock', async () => {
    FactoryTester.setClientMock('TestServiceFactory', {
      handler: getServiceMock
    });

    const clientMock = await FactoryTester.getClient<TestService>('TestServiceFactory');

    equal(clientMock.helloWorld(), 'success');

    FactoryTester.restoreClient('TestServiceFactory');

    const realClient = await FactoryTester.getClient<TestService>('TestServiceFactory');

    equal(realClient.helloWorld(), 'hey');
  });
});
