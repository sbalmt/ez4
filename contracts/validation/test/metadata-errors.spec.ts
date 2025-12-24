import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getValidationServicesMetadata, IncompleteServiceError } from '@ez4/validation/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getValidationServicesMetadata(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('validation metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete validation', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['handler']);
  });
});
