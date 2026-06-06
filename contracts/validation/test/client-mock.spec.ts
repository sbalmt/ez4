import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ValidationTester } from '@ez4/validation/test';

import { rejects } from 'node:assert';

describe('validation client mock tests', () => {
  it('assert :: success validation', async () => {
    const client = ValidationTester.getClientMock('TestValidation');

    equal(client.schema, undefined);

    equal(await client.tryValidate('test'), true);

    await client.validate('test');
  });

  it('assert :: failure validation', async () => {
    const client = ValidationTester.getClientMock('TestValidation', {
      handler: () => {
        throw new Error(`Failed to validate.`);
      }
    });

    equal(client.schema, undefined);

    equal(await client.tryValidate('test'), false);

    await rejects(() => client.validate('test'));
  });

  it('assert :: global instance mock', async () => {
    ValidationTester.setClientMock('TestServiceValidation', {
      handler: (input) => {
        if (input.value === 'fail') {
          throw new Error(`Failed to validate`);
        }
      }
    });

    const clientMock = ValidationTester.getClient('TestServiceValidation');

    equal(await clientMock.tryValidate('not-fail'), true);
    equal(await clientMock.tryValidate('fail'), false);

    await rejects(() => clientMock.validate('fail'));

    ValidationTester.restoreClient('TestServiceValidation');

    const realClient = ValidationTester.getClient('TestServiceValidation');

    equal(await realClient.tryValidate('not-fail'), true);
    equal(await realClient.tryValidate('fail'), true);

    await realClient.validate('fail');
  });
});
