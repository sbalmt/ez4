import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getBucketServices } from '@ez4/storage/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const reflection = getReflection([sourceFile]);
  const result = getBucketServices(reflection);

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

describe('storage metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: basic storage', () => testFile('service'));
  it('assert :: storage events', () => testFile('events'));
  it('assert :: storage cors', () => testFile('cors'));
  it('assert :: events listener', () => testFile('listener'));
});
