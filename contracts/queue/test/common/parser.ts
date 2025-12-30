import { getQueueImportsMetadata, getQueueServicesMetadata } from '@ez4/queue/library';
import { buildReflection } from '@ez4/project/library';

import { equal } from 'assert/strict';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const queueServices = getQueueServicesMetadata(reflection);
  const queueImports = getQueueImportsMetadata(reflection);

  const errors = [...queueServices.errors, ...queueImports.errors];

  equal(errors.length, errorCount);

  return errors;
};
