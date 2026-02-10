import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/gateway/library';
import { buildMetadata } from '@ez4/project/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/ws/input/output-${fileName}.ts`;
  const outputFile = `./test/ws/output/${fileName}.json`;

  const { metadata } = buildMetadata([sourceFile]);

  if (!existsSync(outputFile) || overwrite) {
    writeFileSync(outputFile, JSON.stringify(metadata, undefined, 2));
  } else {
    deepEqual(metadata, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('ws metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: basic service', () => testFile('service'));
  it('assert :: service defaults', () => testFile('defaults'));
  it('assert :: service variables', () => testFile('variables'));
  it('assert :: service event', () => testFile('event'));
  it('assert :: service validation', () => testFile('validation'));
  it('assert :: connection authorizers', () => testFile('authorizer'));
  it('assert :: connection query', () => testFile('query'));
  it('assert :: target headers', () => testFile('headers'));
  it('assert :: target identity', () => testFile('identity'));
  it('assert :: target listener', () => testFile('listener'));
  it('assert :: target vpc', () => testFile('vpc'));
});
