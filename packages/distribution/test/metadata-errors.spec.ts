import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError } from '@ez4/distribution/library';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCdnServices } from '@ez4/distribution/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);
  const result = getCdnServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe.only('distribution metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete distribution', () => {
    const [error1, error2] = parseFile('incomplete-service', 2);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['target']);

    ok(error2 instanceof IncompleteServiceError);
    deepEqual(error2.properties, ['expression']);
  });
});
