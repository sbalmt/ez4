import type { TestContext } from 'node:test';
import type { TestOptionsIsolation } from './cases/options-isolation';

import { FactoryTester } from '@ez4/factory/test';

import { describe, it } from 'node:test';

import { TestLevel } from './cases/options-isolation';

describe('factory options isolation test', () => {
  it('call first level', (test: TestContext) => {
    const instance = FactoryTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.First
    });

    test.assert.ok(instance);
    test.assert.equal(instance.labelName(), 'A');
  });

  it('call nested level', (test: TestContext) => {
    const instance = FactoryTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.Nested
    });

    test.assert.ok(instance);
    test.assert.equal(instance.labelName(), 'B');
  });
});
