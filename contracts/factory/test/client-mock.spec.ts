import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FactoryTester } from '@ez4/factory/test';
import { throws } from 'node:assert';

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

  it('assert :: set instance mock', async () => {
    FactoryTester.setClientMock('TestService', {
      handler: getServiceMock
    });

    const client = await FactoryTester.getClient<TestService>('TestService');

    equal(client.helloWorld(), 'success');

    FactoryTester.restoreClient('TestService');

    throws(() => FactoryTester.getClient('TestService'));
  });
});
