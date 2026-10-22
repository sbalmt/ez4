import { equal, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { VariablesClient } from '@ez4/common/client';
import { makeVariables } from '@ez4/common/worker';

describe('variables client', () => {
  it('assert :: reads an explicit environment, including empty values', () => {
    const client = VariablesClient.make({
      EZ4_VARIABLE_VALUE: 'value',
      EZ4_VARIABLE_EMPTY: ''
    });

    equal(client.EZ4_VARIABLE_VALUE, 'value');
    equal(client.EZ4_VARIABLE_EMPTY, '');
    equal(client.then, undefined);
  });

  it('assert :: missing variables still throw', () => {
    const client = VariablesClient.make({});

    throws(() => client.EZ4_VARIABLE_MISSING, /Environment variable 'EZ4_VARIABLE_MISSING' is not found/);
  });

  it('assert :: defaults to the process environment', () => {
    const client = VariablesClient.make();

    for (const name of Object.keys(process.env)) {
      equal(client[name], process.env[name]);
    }
  });

  it('assert :: worker services use the supplied environment', () => {
    const client = makeVariables(undefined, {
      variables: {
        EZ4_VARIABLE_VALUE: 'worker-value'
      }
    });

    equal(client.EZ4_VARIABLE_VALUE, 'worker-value');
  });

  it('assert :: worker services default to the process environment', () => {
    const client = makeVariables(undefined, {});

    for (const name of Object.keys(process.env)) {
      equal(client[name], process.env[name]);
    }
  });
});
