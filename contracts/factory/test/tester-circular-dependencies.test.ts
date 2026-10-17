import type { TestContext } from 'node:test';
import type { TestServiceAFactory, TestServiceBFactory } from './cases/circular-dependencies';

import { FactoryTester } from '@ez4/factory/tester';

import { describe, it } from 'node:test';

describe('factory tester (circular dependencies test)', () => {
  it('assert :: no call stack size exceeded (when calling A)', async (test: TestContext) => {
    const instanceA = await FactoryTester.getClient<TestServiceAFactory>('TestServiceAFactory');

    test.assert.ok(instanceA);
    test.assert.equal(instanceA.buildName(), 'AB');
  });

  it('assert :: no call stack size exceeded (when calling B)', async (test: TestContext) => {
    const instanceB = await FactoryTester.getClient<TestServiceBFactory>('TestServiceBFactory');

    test.assert.ok(instanceB);
    test.assert.equal(instanceB.buildName(), 'BA');
  });
});
