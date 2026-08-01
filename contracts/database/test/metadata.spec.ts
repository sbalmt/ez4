import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/database/library';
import { buildMetadata } from '@ez4/project/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const { metadata } = buildMetadata([sourceFile]);

  if (overwrite) {
    writeFileSync(outputFile, JSON.stringify(metadata, undefined, 2));
  } else {
    deepEqual(metadata, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('database service metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: empty databases', () => testFile('database'));
  it('assert :: database tables', () => testFile('tables'));
  it('assert :: database scalability', () => testFile('scalability'));
  it('assert :: table schema', () => testFile('schema'));
  it('assert :: table indexes', () => testFile('indexes'));
  it('assert :: table relations', () => testFile('relations'));
  it('assert :: table stream', () => testFile('stream'));
  it('assert :: stream variables', () => testFile('variables'));
  it('assert :: stream dependencies', () => testFile('dependencies'));
  it('assert :: stream listener', () => testFile('listener'));
});
