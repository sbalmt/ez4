import { equal, deepEqual, ok } from 'assert/strict';
import { describe, it } from 'node:test';

import { tryCreateTrigger } from '@ez4/project/library';

import {
  registerTriggers,
  getLinkedVariablesObject,
  getLinkedServicesObject,
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

    const variables = getLinkedVariablesObject(members[0], testErrors);

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

    tryCreateTrigger('@ez4/project:test-service', {
      'metadata:getLinkedService': (type) => {
        ok(type.name === 'TestServiceA' || type.name === 'TestServiceB');

        return 'test-ok';
      }
    });

    const services = getLinkedServicesObject(members[0], reflection, testErrors);

    equal(testErrors.length, 0);

    deepEqual(services, {
      testServiceA: {
        reference: 'test-ok'
      },
      testServiceB: {
        reference: 'test-ok',
        options: {
          foo: true,
          bar: 123,
          baz: 'abc'
        }
      }
    });
  });
});
