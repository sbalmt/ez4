import { equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { createTrigger } from '@ez4/project/library';

import {
  registerTriggers,
  getLinkedVariableList,
  getLinkedServiceList,
  getPropertyBoolean,
  getPropertyNumber,
  getPropertyString
} from '@ez4/common/library';

import { loadTestMember } from './common';
describe('common metadata', () => {
  registerTriggers();

  process.env.TEST_STRING = 'test-env-var';
  process.env.TEST_BOOLEAN = 'true';
  process.env.TEST_NUMBER = '123';

  it('assert :: environment variable', () => {
    const { members } = loadTestMember('variable');
    const testErrors: Error[] = [];

    const variables = getLinkedVariableList(members[0], testErrors);

    equal(testErrors.length, 0);

    deepEqual(variables, {
      TEST_VAR: 'test-var',
      TEST_ENV_VAR: 'test-env-var'
    });
  });

  it('assert :: environment value', () => {
    const { members } = loadTestMember('value');

    const booleanValue = getPropertyBoolean(members[0]);
    const defaultBoolean = getPropertyBoolean(members[1]);

    const numberValue = getPropertyNumber(members[2]);
    const defaultNumber = getPropertyNumber(members[3]);

    const stringValue = getPropertyString(members[4]);
    const defaultString = getPropertyString(members[5]);

    equal(booleanValue, true);
    equal(defaultBoolean, false);

    equal(numberValue, 123);
    equal(defaultNumber, -1);

    equal(stringValue, 'test-env-var');
    equal(defaultString, 'default');
  });

  it('assert :: environment service', () => {
    const { members, reflection } = loadTestMember('service');
    const testErrors: Error[] = [];

    createTrigger('@ez4/project:test-service', {
      'metadata:getLinkedService': (type) => {
        equal(type.name, 'TestService');

        return 'test-ok';
      }
    });

    const services = getLinkedServiceList(members[0], reflection, testErrors);

    equal(testErrors.length, 0);

    deepEqual(services, {
      testService: 'test-ok'
    });
  });
});
