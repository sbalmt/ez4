import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/queue/library';
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

describe('queue metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: empty queues', () => testFile('service'));
  it('assert :: queue dead-letter', () => testFile('deadletter'));
  it('assert :: queue subscriptions', () => testFile('subscriptions'));
  it('assert :: subscription listener', () => testFile('listener'));
  it('assert :: service variables', () => testFile('variables'));
  it('assert :: queue message', () => testFile('message'));
  it('assert :: import queue', () => testFile('import'));
});
