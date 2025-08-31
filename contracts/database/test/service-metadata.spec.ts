import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getDatabaseServices } from '@ez4/database/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/models/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const reflection = getReflection([sourceFile]);
  const result = getDatabaseServices(reflection);

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

describe('database service metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: empty databases', () => testFile('database'));
  it('assert :: database tables', () => testFile('tables'));
  it('assert :: database scalability', () => testFile('scalability', true));
  it('assert :: table schema', () => testFile('schema'));
  it('assert :: table indexes', () => testFile('indexes'));
  it('assert :: table relations', () => testFile('relations'));
  it('assert :: table stream', () => testFile('stream'));
  it('assert :: stream listener', () => testFile('listener'));
});
