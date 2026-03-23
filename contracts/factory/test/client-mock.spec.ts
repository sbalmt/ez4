import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FactoryTester } from '@ez4/factory/test';

describe('factory client mock tests', () => {
  it('assert :: create instance', async () => {
    const client = FactoryTester.getClientMock<string>('Test', {
      handler: () => 'success'
    });

    equal(client, 'success');
  });
});
