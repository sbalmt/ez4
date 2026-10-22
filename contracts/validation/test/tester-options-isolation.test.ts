import type { TestContext } from 'node:test';
import type { TestOptionsIsolation } from './cases/options-isolation';

import { ValidationTester } from '@ez4/validation/tester';

import { describe, it } from 'node:test';

import { TestLevel } from './cases/options-isolation';

describe('validation tester (options isolation test)', () => {
  it('assert :: call first level', async (test: TestContext) => {
    const instance = await ValidationTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.First
    });

    test.assert.ok(instance);

    test.assert.equal(await instance.tryValidate({ data: 'A' }), true);
  });

  it('assert :: call first level (validation error)', async (test: TestContext) => {
    const instance = await ValidationTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.First
    });

    test.assert.ok(instance);

    await test.assert.rejects(() => instance.validate({ data: 'B' }), {
      message: 'First level must have data "A".'
    });
  });

  it('assert :: call nested level', async (test: TestContext) => {
    const instance = await ValidationTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.Nested
    });

    test.assert.ok(instance);

    test.assert.equal(await instance.tryValidate({ data: 'B' }), true);
  });

  it('assert :: call nested level (validation error)', async (test: TestContext) => {
    const instance = await ValidationTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.Nested
    });

    test.assert.ok(instance);

    await test.assert.rejects(() => instance.validate({ data: 'A' }), {
      message: 'Nested level must have data "B".'
    });
  });
});
