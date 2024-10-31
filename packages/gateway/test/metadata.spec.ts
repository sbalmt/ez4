import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getReflection } from '@ez4/project/library';
import { registerTriggers, getHttpServices } from '@ez4/gateway/library';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const reflection = getReflection([sourceFile]);
  const result = getHttpServices(reflection);

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

describe.only('http metadata', () => {
  registerTriggers();

  process.env.TEST_ENV_VAR = 'test-env-var-value';

  it.only('assert :: empty services', () => testFile('service'));
  it.only('assert :: service routes', () => testFile('route'));
  it.only('assert :: route authorizers', () => testFile('authorizer'));
  it.only('assert :: route headers', () => testFile('headers'));
  it.only('assert :: route identity', () => testFile('identity'));
  it.only('assert :: route parameters', () => testFile('parameters'));
  it.only('assert :: route query', () => testFile('query'));
  it.only('assert :: route body', () => testFile('body'));
  it.only('assert :: route cors', () => testFile('cors'));
});
