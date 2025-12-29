import { getQueueImportsMetadata, getQueueServicesMetadata } from '@ez4/queue/library';
import { buildReflection } from '@ez4/project/library';

import { equal } from 'assert/strict';

export const parseFile = (fileName: string, errorCount: number, isImport?: boolean) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = isImport ? getQueueImportsMetadata(reflection) : getQueueServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
