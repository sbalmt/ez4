import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ValidationTester } from '@ez4/validation/test';

import { rejects, throws } from 'node:assert';

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
    ValidationTester.setClientMock('TestValidation', {
      handler: (input) => {
        if (input.value === 'fail') {
          throw new Error(`Failed to validate`);
        }
      }
    });

    const client = await ValidationTester.getClient('TestValidation');

    equal(await client.tryValidate('not-fail'), true);
    equal(await client.tryValidate('fail'), false);

    await rejects(() => client.validate('fail'));

    ValidationTester.restoreClient('TestValidation');

    throws(() => ValidationTester.getClient('TestValidation'));
  });
});
