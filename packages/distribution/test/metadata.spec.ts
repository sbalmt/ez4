import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getCdnServices } from '@ez4/distribution/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const reflection = getReflection([sourceFile]);
  const result = getCdnServices(reflection);

  result.errors.forEach((error) => {
    console.error(error.message);
  });

  equal(result.errors.length, 0);

  if (overwrite) {
    writeFileSync(outputFile, JSON.stringify(result.services, undefined, 2));
  } else {
    deepEqual(result.services, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('distribution metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: basic distribution', () => testFile('service'));
});
