import { buildMetadata } from '@ez4/project/library';

import { equal, deepEqual } from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { getGatewayServices } from '../src/utils/service';
import { OpenApiGenerator } from '../src/generator/oas';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.yml`;

  const { metadata } = buildMetadata([sourceFile]);
  const apis = getGatewayServices(metadata);

  equal(apis.length, 1);

  const outputContent = OpenApiGenerator.getGatewayOutput(apis[0]);

  if (overwrite) {
    writeFileSync(outputFile, outputContent);
  } else {
    deepEqual(outputContent, readFileSync(outputFile).toString());
  }
};

describe('gateway documentation (open api output)', () => {
  it('assert :: empty api', () => testFile('empty'));
  it('assert :: post route', () => testFile('post'));
  it('assert :: get route', () => testFile('get'));
  it('assert :: patch route', () => testFile('patch'));
  it('assert :: put route', () => testFile('put'));
  it('assert :: delete route', () => testFile('delete'));
  it('assert :: naming style', () => testFile('naming-style'));
  it('assert :: operation', () => testFile('operation'));
  it('assert :: auth header', () => testFile('auth-header'));
  it('assert :: auth query', () => testFile('auth-query'));
  it('assert :: auth jwt', () => testFile('auth-jwt'));
});
