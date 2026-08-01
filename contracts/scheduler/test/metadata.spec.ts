import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/scheduler/library';
import { buildMetadata } from '@ez4/project/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const { metadata } = buildMetadata([sourceFile]);

  if (!existsSync(outputFile) || overwrite) {
    writeFileSync(outputFile, JSON.stringify(metadata, undefined, 2));
  } else {
    deepEqual(metadata, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('scheduler metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: static scheduler', () => testFile('static'));
  it('assert :: dynamic scheduler', () => testFile('dynamic'));
  it('assert :: target dependencies', () => testFile('dependencies'));
  it('assert :: target listener', () => testFile('listener'));
  it('assert :: target vpc', () => testFile('vpc'));
  it('assert :: scheduler event', () => testFile('event'));
});
