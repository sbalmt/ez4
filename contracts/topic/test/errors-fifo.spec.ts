import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import {
  IncompleteFifoModeError,
  IncorrectFifoModePropertyError,
  IncorrectFifoModeTypeError,
  InvalidFifoModeTypeError
} from '@ez4/topic/library';

import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/topic/library';
import { parseFile } from './common/parser';

describe('topic fifo metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete fifo mode', () => {
    const [error1] = parseFile('incomplete-fifo', 1);

    ok(error1 instanceof IncompleteFifoModeError);
    deepEqual(error1.properties, ['groupId']);
  });

  it('assert :: incorrect fifo mode', () => {
    const [error1, error2] = parseFile('incorrect-fifo', 2);

    ok(error1 instanceof IncorrectFifoModeTypeError);
    equal(error1.baseType, 'Topic.FifoMode');
    equal(error1.modelType, 'TestFifoMode');

    ok(error2 instanceof IncorrectFifoModePropertyError);
    deepEqual(error2.properties, ['wrong']);
  });

  it('assert :: invalid fifo mode', () => {
    const [error1] = parseFile('invalid-fifo-class', 1);

    ok(error1 instanceof InvalidFifoModeTypeError);
    equal(error1.baseType, 'Topic.FifoMode');
  });

  it('assert :: invalid fifo property', () => {
    const [error1] = parseFile('invalid-fifo-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    equal(error1.propertyName, 'invalid_property');
  });
});
