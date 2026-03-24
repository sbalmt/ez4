import type { TestContext } from 'node:test';
import type { TestService } from './input/circular-dependencies';

import { FactoryTester } from '@ez4/factory/test';

import { describe, it } from 'node:test';

describe('factory circular dependencies test', async () => {
  await it('no call stack size exceeded (when calling A)', async (test: TestContext) => {
    const instanceA = await FactoryTester.getClient<TestService>('TestServiceAFactory');

    test.assert.ok(instanceA);
    test.assert.equal(instanceA.buildName(), 'AB');
  });

  await it('no call stack size exceeded (when calling B)', async (test: TestContext) => {
    const instanceB = await FactoryTester.getClient<TestService>('TestServiceBFactory');

    test.assert.ok(instanceB);
    test.assert.equal(instanceB.buildName(), 'BA');
  });
});
