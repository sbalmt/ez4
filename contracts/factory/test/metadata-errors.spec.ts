import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getFactoryServicesMetadata, IncompleteServiceError } from '@ez4/factory/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getFactoryServicesMetadata(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('topic metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete factory', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['handler']);
  });
});
