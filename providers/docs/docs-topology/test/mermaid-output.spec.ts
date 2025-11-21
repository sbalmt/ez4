import { buildMetadata } from '@ez4/project/library';

import { deepEqual } from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { MermaidGenerator } from '../src/generator/mermaid';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.mmd`;

  const { metadata } = buildMetadata([sourceFile]);

  const outputContent = MermaidGenerator.getTopologyOutput(metadata);

  if (overwrite) {
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
});
