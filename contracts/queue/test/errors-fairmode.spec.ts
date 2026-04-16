import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteFairModeError,
  IncorrectFairModePropertyError,
  IncorrectFairModeTypeError,
  InvalidFairModeTypeError
} from '@ez4/queue/library';

import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/queue/library';

import { parseFile } from './common/parser';

describe('queue fair mode metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete fair mode', () => {
    const [error1] = parseFile('incomplete-fairmode', 1);

    ok(error1 instanceof IncompleteFairModeError);
    deepEqual(error1.properties, ['groupId']);
  });

  it('assert :: incorrect fair mode', () => {
    const [error1, error2] = parseFile('incorrect-fairmode', 2);

    ok(error1 instanceof IncorrectFairModeTypeError);
    equal(error1.baseType, 'Queue.FairMode');
    equal(error1.modelType, 'TestFairMode');

    ok(error2 instanceof IncorrectFairModePropertyError);
    deepEqual(error2.properties, ['wrong']);
  });

  it('assert :: invalid fair mode (declaration)', () => {
    const [error1] = parseFile('invalid-fairmode-class', 1);

    ok(error1 instanceof InvalidFairModeTypeError);
    equal(error1.baseType, 'Queue.FairMode');
  });

  it('assert :: invalid fair mode (property)', () => {
    const [error1] = parseFile('invalid-fairmode-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
