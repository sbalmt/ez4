import { buildMetadata } from '@ez4/project/library';

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TopologyGenerator } from '../src/generator/topology';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.mmd`;

  const { metadata } = buildMetadata([sourceFile]);

  const outputContent = TopologyGenerator.getTopologyOutput(metadata);

  if (!existsSync(outputFile) || overwrite) {
    writeFileSync(outputFile, outputContent);
  } else {
    deepEqual(outputContent, readFileSync(outputFile).toString());
  }
};

describe('topology documentation (mermaid output)', () => {
  it('assert :: api', () => testFile('api'));
  it('assert :: bucket', () => testFile('bucket'));
  it('assert :: database', () => testFile('database'));
  it('assert :: scheduler', () => testFile('scheduler'));
  it('assert :: queue', () => testFile('queue'));
  it('assert :: topic', () => testFile('topic'));
  it('assert :: topic with queue', () => testFile('topic-queue'));
  it('assert :: cdn', () => testFile('cdn'));
  it('assert :: validation', () => testFile('validation'));
  it('assert :: factory', () => testFile('factory'));
});
