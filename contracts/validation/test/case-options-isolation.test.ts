import type { TestContext } from 'node:test';
import type { TestOptionsIsolation } from './cases/options-isolation';

import { ValidationTester } from '@ez4/validation/test';

import { describe, it } from 'node:test';

import { TestLevel } from './cases/options-isolation';

describe('validation options isolation test', async () => {
  await it('call first level', async (test: TestContext) => {
    const instance = await ValidationTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.First
    });

    test.assert.ok(instance);

    const validation = await instance.tryValidate({
      data: 'A'
    });

    test.assert.equal(validation, true);

    await test.assert.rejects(() =>
      instance.validate({
        data: 'B'
      })
    );
  });

  await it('call nested level', async (test: TestContext) => {
    const instance = await ValidationTester.getClient<TestOptionsIsolation>('TestOptionsIsolation', {
      level: TestLevel.Nested
    });

    test.assert.ok(instance);

    const validation = await instance.tryValidate({
      data: 'B'
    });

    test.assert.equal(validation, true);

    await test.assert.rejects(() =>
      instance.validate({
        data: 'A'
      })
    );
  });
});
