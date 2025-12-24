import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getReflectionFromFiles } from '@ez4/reflection';

const testFile = (fileName: string, overwrite: boolean = false) => {
  const sourceFile = `./test/types/${fileName}.ts`;
  const outputFile = `./test/results/${fileName}.json`;

  const reflection = getReflectionFromFiles([sourceFile], {
    resolverOptions: {
      includeLocation: true
    }
  });

  if (!existsSync(outputFile) || overwrite) {
    writeFileSync(outputFile, JSON.stringify(reflection, undefined, 2));
  } else {
    deepEqual(reflection, JSON.parse(readFileSync(outputFile).toString()));
  }
};

describe('reflection types', () => {
  it('assert :: boolean', () => testFile('boolean'));
  it('assert :: number', () => testFile('number'));
  it('assert :: string', () => testFile('string'));
  it('assert :: object', () => testFile('object'));
  it('assert :: union', () => testFile('union'));
  it('assert :: intersection', () => testFile('intersection'));
  it('assert :: array', () => testFile('array'));
  it('assert :: tuple', () => testFile('tuple'));
  it('assert :: enum', () => testFile('enum'));
  it('assert :: class', () => testFile('class'));
  it('assert :: interface', () => testFile('interface'));
  it('assert :: function', () => testFile('function'));
  it('assert :: callback', () => testFile('callback'));
  it('assert :: special', () => testFile('special'));
  it('assert :: optional', () => testFile('optional'));
  it('assert :: typeof', () => testFile('typeof'));
  it('assert :: type', () => testFile('type'));
  it('assert :: comments', () => testFile('comments'));
  it('assert :: internal', () => testFile('internal'));
});
