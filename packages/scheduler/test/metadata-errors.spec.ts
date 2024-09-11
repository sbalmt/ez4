import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError } from '@ez4/scheduler/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCronServices } from '@ez4/scheduler/library';

const parseFile = (fileName: string) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getCronServices(reflection);

  return result.errors;
};

describe.only('scheduler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete scheduler', () => {
    const errors = parseFile('incomplete-service');

    equal(errors.length, 1);

    const [error1] = errors;

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['handler']);
  });
});
