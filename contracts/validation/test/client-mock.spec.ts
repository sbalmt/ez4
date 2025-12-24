import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ValidationTester } from '@ez4/validation/test';
import { rejects } from 'node:assert';

describe('validation tests', () => {
  it('assert :: success validation', async () => {
    const client = ValidationTester.getClientMock('Test');

    equal(client.schema, undefined);

    await client.validate('test');
  });

  it('assert :: failure validation', async () => {
    const client = ValidationTester.getClientMock('Test', {
      handler: () => {
        throw new Error(`Failed to validate.`);
      }
    });

    equal(client.schema, undefined);

    await rejects(() => client.validate('test'));
  });
});
