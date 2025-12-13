import { ok, deepEqual, equal } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  registerTriggers,
  IncorrectParameterTypeError,
  MismatchParametersTypeError,
  InvalidParameterTypeError
} from '@ez4/gateway/library';

import { parseFile } from './utils/parser';

describe('http parameters metadata errors', () => {
  registerTriggers();

  it('assert :: incorrect path parameters', () => {
    const [error1] = parseFile('incorrect-parameter', 1);

    ok(error1 instanceof IncorrectParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
    equal(error1.modelType, 'TestParameters');
  });

  it('assert :: invalid path parameters', () => {
    const [error1] = parseFile('invalid-parameter', 1);

    ok(error1 instanceof InvalidParameterTypeError);
    equal(error1.baseType, 'Http.PathParameters');
  });

  it('assert :: mismatch path parameters', () => {
    const [error1] = parseFile('mismatch-parameter', 1);

    ok(error1 instanceof MismatchParametersTypeError);
    deepEqual(error1.parameterNames, ['path']);
  });
});
