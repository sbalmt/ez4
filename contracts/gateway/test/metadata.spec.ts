import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { registerTriggers } from '@ez4/gateway/library';
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

describe('http metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it('assert :: empty services', () => testFile('service'));
  it('assert :: service defaults', () => testFile('defaults'));
  it('assert :: service routes', () => testFile('route'));
  it('assert :: service variables', () => testFile('variables'));
  it('assert :: route authorizers', () => testFile('authorizer'));
  it('assert :: route listener', () => testFile('listener'));
  it('assert :: route provider', () => testFile('provider'));
  it('assert :: route response', () => testFile('response'));
  it('assert :: route headers', () => testFile('headers'));
  it('assert :: route identity', () => testFile('identity'));
  it('assert :: route parameters', () => testFile('parameters'));
  it('assert :: route query', () => testFile('query'));
  it('assert :: route body', () => testFile('body'));
  it('assert :: route errors', () => testFile('errors'));
  it('assert :: route cache', () => testFile('cache'));
  it('assert :: route access', () => testFile('access'));
  it('assert :: route cors', () => testFile('cors'));
  it('assert :: import api', () => testFile('import'));
});
