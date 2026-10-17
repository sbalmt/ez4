import type { TestContext } from 'node:test';

import { ValidationTester } from '@ez4/validation/tester';

import { describe, it } from 'node:test';

describe('validation tester (circular dependencies test)', () => {
  it('assert :: no call stack size exceeded (when calling A)', async (test: TestContext) => {
    const instanceA = await ValidationTester.getClient('TestServiceAValidation');

    test.assert.ok(instanceA);

    test.assert.equal(await instanceA.tryValidate({ nameA: 'A', nameB: 'B' }), true);
  });

  it('assert :: no call stack size exceeded (when calling B)', async (test: TestContext) => {
    const instanceB = await ValidationTester.getClient('TestServiceBValidation');

    test.assert.ok(instanceB);

    test.assert.equal(await instanceB.tryValidate({ nameA: 'A', nameB: 'B' }), true);
  });

  it('assert :: validation error (when calling A)', async (test: TestContext) => {
    const instanceA = await ValidationTester.getClient('TestServiceAValidation');

    test.assert.ok(instanceA);

    await test.assert.rejects(() => instanceA.validate({ nameA: 'A' }), {
      message: 'Missing input name B'
    });
  });

  it('assert :: validation error (when calling B)', async (test: TestContext) => {
    const instanceB = await ValidationTester.getClient('TestServiceBValidation');

    test.assert.ok(instanceB);

    await test.assert.rejects(() => instanceB.validate({ nameB: 'B' }), {
      message: 'Missing input name A'
    });
  });
});
