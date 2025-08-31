import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/topic/library';
import { getMetadata } from '@ez4/project/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const { metadata } = getMetadata([sourceFile]);

  if (overwrite) {
    writeFileSync(outputFile, JSON.stringify(metadata, undefined, 2));
  } else {
    deepEqual(metadata, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('topic metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: empty topic', () => testFile('service'));
  it('assert :: topic subscriptions', () => testFile('subscriptions'));
  it('assert :: topic import', () => testFile('import'));
  it('assert :: subscription listener', () => testFile('listener'));
});
