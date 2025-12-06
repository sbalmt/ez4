import { ok, equal, deepEqual } from 'assert/strict';
import { describe, it } from 'node:test';

import { IncompleteRouteError } from '@ez4/gateway/library';
import { registerTriggers, getHttpServices } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);
  const result = getHttpServices(reflection);

  equal(result.errors.length, errorCount);

  return result.errors;
};

describe('http route metadata errors', () => {
  registerTriggers();

  it('assert :: incomplete service routes', () => {
    const [error1, error2] = parseFile('incomplete-route', 2);

    ok(error1 instanceof IncompleteRouteError);
    deepEqual(error1.properties, ['path']);

    ok(error2 instanceof IncompleteRouteError);
    deepEqual(error2.properties, ['handler']);
  });
});
