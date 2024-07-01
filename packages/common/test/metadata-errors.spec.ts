import { ok, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  InvalidServiceError,
  MissingServiceProviderError,
  MissingServiceError,
  MissingVariableError
} from '@ez4/common/library';

import { registerTriggers, getLinkedVariables, getLinkedServices } from '@ez4/common/library';

import { loadTestMember } from './common.js';

describe.only('common metadata errors', () => {
  registerTriggers();

  it('assert :: missing variable', () => {
    const { member } = loadTestMember('missing-variable');
    const testErrors: Error[] = [];

    getLinkedVariables(member, testErrors);

    equal(testErrors.length, 1);

    const [error] = testErrors;

    ok(error instanceof MissingVariableError);
    equal(error.variableName, 'TEST_VAR');
  });

  it('assert :: missing service', () => {
    const { member, reflection } = loadTestMember('missing-service');
    const testErrors: Error[] = [];

    getLinkedServices(member, reflection, testErrors);

    equal(testErrors.length, 1);

    const [error] = testErrors;

    ok(error instanceof MissingServiceError);
    equal(error.serviceName, 'testService');
  });

  it('assert :: missing service provider', () => {
    const { member, reflection } = loadTestMember('missing-service-provider');
    const testErrors: Error[] = [];

    getLinkedServices(member, reflection, testErrors);

    equal(testErrors.length, 1);

    const [error] = testErrors;

    ok(error instanceof MissingServiceProviderError);
    equal(error.serviceName, 'TestService');
  });

  it('assert :: invalid service', () => {
    const { member, reflection } = loadTestMember('invalid-service');
    const testErrors: Error[] = [];

    getLinkedServices(member, reflection, testErrors);

    equal(testErrors.length, 1);

    const [error] = testErrors;

    ok(error instanceof InvalidServiceError);
    equal(error.serviceName, 'TestService');
  });
});
