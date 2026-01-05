import { ok, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError, IncompleteOriginError, IncorrectOriginTypeError, InvalidOriginTypeError } from '@ez4/distribution/library';
import { InvalidServicePropertyError } from '@ez4/common/library';
import { registerTriggers } from '@ez4/distribution/library';

import { parseFile } from './common/parser';

describe('distribution origin metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete origin', () => {
    const [error1, error2] = parseFile('incomplete-origin', 2);

    ok(error1 instanceof IncompleteOriginError);
    deepEqual(error1.properties, ['domain', 'bucket']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: incorrect origin', () => {
    const [error1, error2] = parseFile('incorrect-origin', 2);

    ok(error1 instanceof IncorrectOriginTypeError);
    deepEqual(error1.baseType, 'Cdn.Origin');
    deepEqual(error1.originType, 'TestOrigin');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: invalid origin (declaration)', () => {
    const [error1, error2] = parseFile('invalid-origin-class', 2);

    ok(error1 instanceof InvalidOriginTypeError);
    deepEqual(error1.baseType, 'Cdn.Origin');

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['defaultOrigin']);
  });

  it('assert :: invalid origin (property)', () => {
    const [error1] = parseFile('invalid-origin-property', 1);

    ok(error1 instanceof InvalidServicePropertyError);
    deepEqual(error1.propertyName, 'invalid_property');
  });
});
