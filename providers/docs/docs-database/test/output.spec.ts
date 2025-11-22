import { buildMetadata } from '@ez4/project/library';

import { equal, deepEqual } from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { EntityRelationshipGenerator } from '../src/generator/erd';
import { getDatabaseServices } from '../src/utils/service';

const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/output-${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.mmd`;

  const { metadata } = buildMetadata([sourceFile]);
  const databases = getDatabaseServices(metadata);

  equal(databases.length, 1);

  const outputContent = EntityRelationshipGenerator.getDatabaseOutput(databases[0]);

  if (overwrite) {
    writeFileSync(outputFile, outputContent);
  } else {
    deepEqual(outputContent, readFileSync(outputFile).toString());
  }
};

describe('database documentation (mermaid output)', () => {
  it('assert :: empty databases', () => testFile('empty'));
  it('assert :: database tables', () => testFile('tables'));
  it('assert :: table relations (one-to-many)', () => testFile('one-to-many'));
  it('assert :: table relations (one-to-one)', () => testFile('one-to-one'));
});
