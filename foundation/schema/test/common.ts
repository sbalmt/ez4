import type { SchemaContextOptions } from '@ez4/schema/library';

import { readFileSync, writeFileSync } from 'node:fs';
import { deepEqual, ok } from 'node:assert/strict';

import { createSchemaContext, getAnySchema } from '@ez4/schema/library';
import { getReflection } from '@ez4/project/library';

export type TestFileOptions = SchemaContextOptions & {
  overwrite?: boolean;
  fileName?: string;
  nullish?: boolean;
};

export const testFile = (fileName: string, options?: TestFileOptions) => {
  const outputFile = `./test/output/${options?.fileName ?? fileName}.json`;
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);

  const entryKey = Object.keys(reflection).find((key) => key.endsWith('TestSchema'));

  ok(entryKey);

  const testType = reflection[entryKey];
  const schema = getAnySchema(testType, reflection, createSchemaContext(options));

  if (options?.overwrite) {
    writeFileSync(outputFile, JSON.stringify(schema, undefined, 2));
  } else {
    deepEqual(schema, JSON.parse(readFileSync(outputFile).toString()));
  }
};
