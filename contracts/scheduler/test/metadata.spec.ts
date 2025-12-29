import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers, getCronServicesMetadata } from '@ez4/scheduler/library';
import { buildReflection } from '@ez4/project/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const reflection = buildReflection([sourceFile]);
  const result = getCronServicesMetadata(reflection);

  result.errors.forEach((error) => {
    console.error(error.message);
  });

  equal(result.errors.length, 0);

  if (!existsSync(outputFile) || overwrite) {
    writeFileSync(outputFile, JSON.stringify(result.services, undefined, 2));
  } else {
    deepEqual(result.services, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('scheduler metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: basic scheduler', () => testFile('service'));
  it('assert :: dynamic scheduler', () => testFile('dynamic'));
  it('assert :: target listener', () => testFile('listener'));
  it('assert :: scheduler event', () => testFile('event'));
});
