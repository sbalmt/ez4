import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, ok } from 'node:assert/strict';

import { getReflection } from '@ez4/project/library';
import { getAnySchema } from '@ez4/schema/library';

export const testFile = (fileName: string, overwrite = false) => {
  const sourceFile = `./test/input/${fileName}.ts`;
  const outputFile = `./test/output/${fileName}.json`;

  const reflection = getReflection([sourceFile]);

  const entryKey = Object.keys(reflection).find((key) => key.endsWith('TestSchema'));

  ok(entryKey);

  const testType = reflection[entryKey];
  const schema = getAnySchema(testType, reflection);

  if (overwrite) {
    writeFileSync(outputFile, JSON.stringify(schema, undefined, 2));
  } else {
    deepEqual(schema, JSON.parse(readFileSync(outputFile).toString()));
  }
};
