import { equal } from 'assert/strict';

import { getCronServicesMetadata } from '@ez4/scheduler/library';
import { buildReflection } from '@ez4/project/library';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = getCronServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
