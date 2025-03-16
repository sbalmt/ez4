import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getMetadata } from '@ez4/project/library';
import { registerTriggers } from '@ez4/queue/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const metadata = getMetadata([sourceFile]);

  if (overwrite) {
    writeFileSync(outputFile, JSON.stringify(metadata, undefined, 2));
  } else {
    deepEqual(metadata, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('queue metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: empty queues', () => testFile('service'));
  it('assert :: queue subscriptions', () => testFile('subscriptions'));
  it('assert :: queue import', () => testFile('import'));
  it('assert :: subscription listener', () => testFile('listener'));
});
