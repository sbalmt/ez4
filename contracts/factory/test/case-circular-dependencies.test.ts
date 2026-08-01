import type { TestContext } from 'node:test';
import type { TestServiceAFactory, TestServiceBFactory } from './cases/circular-dependencies';

import { FactoryTester } from '@ez4/factory/test';

import { describe, it } from 'node:test';

describe('factory circular dependencies test', () => {
  it('no call stack size exceeded (when calling A)', (test: TestContext) => {
    const instanceA = FactoryTester.getClient<TestServiceAFactory>('TestServiceAFactory');

    test.assert.ok(instanceA);
    test.assert.equal(instanceA.buildName(), 'AB');
  });

  it('no call stack size exceeded (when calling B)', (test: TestContext) => {
    const instanceB = FactoryTester.getClient<TestServiceBFactory>('TestServiceBFactory');

    test.assert.ok(instanceB);
    test.assert.equal(instanceB.buildName(), 'BA');
  });
});
