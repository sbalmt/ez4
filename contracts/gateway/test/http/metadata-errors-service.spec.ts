import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteServiceError } from '@ez4/gateway/library';
import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http service metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service', () => {
    const [error1] = parseFile('incomplete-service', 1);

    ok(error1 instanceof IncompleteServiceError);
    deepEqual(error1.properties, ['routes']);
  });
});
