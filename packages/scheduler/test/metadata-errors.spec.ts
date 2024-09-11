import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError } from '@ez4/scheduler/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCronServices } from '@ez4/scheduler/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getCronServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('scheduler metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete scheduler', () => {
    const [error1, error2] = parseFile('incomplete-service', 2);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['handler']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['expression']);
  });
});
