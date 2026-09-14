import { deepEqual, rejects } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { resolveValidation } from '@ez4/gateway/utils';

describe('gateway validator utils', () => {
  it('assert :: resolve missing validator', async () => {
    await resolveValidation({ value: 1 }, {}, 'MissingValidator');
  });

  it('assert :: resolve existing validator', async () => {
    const input = { value: 1 };

    const validators = {
      '@ExistingValidator': {
        validate: (input: unknown) => {
          received = input;
        }
      }
    };

    let received: unknown;

    await resolveValidation(input, validators, 'ExistingValidator');

    deepEqual(received, input);
  });

  it('assert :: propagate validator failure', async () => {
    const failure = new Error('Validation failed');

    const validators = {
      '@FailingValidator': {
        validate: () => {
          return Promise.reject(failure);
        }
      }
    };

    await rejects(() => resolveValidation({ value: 1 }, validators, 'FailingValidator'), failure);
  });
});
