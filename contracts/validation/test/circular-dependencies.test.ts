import type { TestContext } from 'node:test';

import { ValidationTester } from '@ez4/validation/test';

import { describe, it } from 'node:test';

describe('validation circular dependencies test', async () => {
  await it('no call stack size exceeded (when calling A)', async (test: TestContext) => {
    const instanceA = await ValidationTester.getClient('TestServiceAValidation');

    test.assert.ok(instanceA);

    const validation = await instanceA.tryValidate({
      nameA: 'A',
      nameB: 'B'
    });

    test.assert.equal(validation, true);

    await test.assert.rejects(() =>
      instanceA.validate({
        nameA: 'A'
      })
    );
  });

  await it('no call stack size exceeded (when calling B)', async (test: TestContext) => {
    const instanceB = await ValidationTester.getClient('TestServiceBValidation');

    test.assert.ok(instanceB);

    const validation = await instanceB.tryValidate({
      nameA: 'A',
      nameB: 'B'
    });

    test.assert.equal(validation, true);

    await test.assert.rejects(() =>
      instanceB.validate({
        nameB: 'B'
      })
    );
  });
});
