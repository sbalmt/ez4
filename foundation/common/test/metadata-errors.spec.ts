import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import { InvalidServiceError, MissingServiceProviderError, MissingServiceError, MissingVariableError } from '@ez4/common/library';

import { registerTriggers, getLinkedVariablesObject, getLinkedServicesObject } from '@ez4/common/library';

import { loadTestMember } from './common';

describe('common metadata errors', () => {
  registerTriggers();

  it('assert :: missing variable', () => {
    const { members } = loadTestMember('missing-variable');
    const testErrors: Error[] = [];

    getLinkedVariablesObject(members[0], testErrors);

    equal(testErrors.length, 1);

    const [error] = testErrors;

    ok(error instanceof MissingVariableError);
    equal(error.variableName, 'TEST_VAR');
  });

  it('assert :: missing service', () => {
    const { members, reflection } = loadTestMember('missing-service');
    const testErrors: Error[] = [];

    getLinkedServicesObject(members[0], reflection, testErrors);

    equal(testErrors.length, 1);

    const [error] = testErrors;

    ok(error instanceof MissingServiceError);
    equal(error.serviceName, 'testService');
  });

  it('assert :: missing service provider', () => {
    const { members, reflection } = loadTestMember('missing-service-provider');
    const testErrors: Error[] = [];

    getLinkedServicesObject(members[0], reflection, testErrors);

    equal(testErrors.length, 2);

    const [error1, error2] = testErrors;

    ok(error1 instanceof MissingServiceProviderError);
    equal(error1.serviceName, 'TestService');

    ok(error2 instanceof MissingServiceError);
    equal(error2.serviceName, 'testService');
  });

  it('assert :: invalid service', () => {
    const { members, reflection } = loadTestMember('invalid-service');
    const testErrors: Error[] = [];

    getLinkedServicesObject(members[0], reflection, testErrors);

    equal(testErrors.length, 2);

    const [error1, error2] = testErrors;

    ok(error1 instanceof InvalidServiceError);
    equal(error1.serviceName, 'TestService');

    ok(error2 instanceof MissingServiceError);
    equal(error2.serviceName, 'testService');
  });
});
