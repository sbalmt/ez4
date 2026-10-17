import type { TestContext } from 'node:test';
import type { TestOptionsIsolation } from './cases/options-isolation';

import { FactoryTester } from '@ez4/factory/tester';

import { describe, it } from 'node:test';

import { TestLevel } from './cases/options-isolation';

describe('factory tester (options isolation test)', () => {
  it('assert :: call first level', async (test: TestContext) => {
    const instance = await FactoryTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.First
    });

    test.assert.ok(instance);
    test.assert.equal(instance.labelName(), 'A');
  });

  it('assert :: call nested level', async (test: TestContext) => {
    const instance = await FactoryTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.Nested
    });

    test.assert.ok(instance);
    test.assert.equal(instance.labelName(), 'B');
  });
});
