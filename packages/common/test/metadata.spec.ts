import { equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getLinkedVariableList, getLinkedServiceList } from '@ez4/common/library';
import { createTrigger } from '@ez4/project/library';

import { loadTestMember } from './common.js';

describe.only('common metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var';

  it('assert :: environment variable', () => {
    const { member } = loadTestMember('variable');
    const testErrors: Error[] = [];

    const variables = getLinkedVariableList(member, testErrors);

    equal(testErrors.length, 0);

    deepEqual(variables, {
      TEST_VAR: 'test-var',
      TEST_ENV_VAR: 'test-env-var'
    });
  });

  it('assert :: environment service', () => {
    const { member, reflection } = loadTestMember('service');
    const testErrors: Error[] = [];

    createTrigger('@ez4/project:test-service', {
      'metadata:getLinkedService': (type) => {
        equal(type.name, 'TestService');

        return 'test-ok';
      }
    });

    const services = getLinkedServiceList(member, reflection, testErrors);

    equal(testErrors.length, 0);

    deepEqual(services, {
      testService: 'test-ok'
    });
  });
});
