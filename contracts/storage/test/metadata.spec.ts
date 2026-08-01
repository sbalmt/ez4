import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/storage/library';
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

describe('storage metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: basic storage', () => testFile('service'));
  it('assert :: storage events', () => testFile('events'));
  it('assert :: storage cors', () => testFile('cors'));
  it('assert :: events variables', () => testFile('variables'));
  it('assert :: events dependencies', () => testFile('dependencies'));
  it('assert :: events listener', () => testFile('listener'));
  it('assert :: events vpc', () => testFile('vpc'));
});
