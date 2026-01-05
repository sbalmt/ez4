import { equal } from 'assert/strict';

import { getBucketServicesMetadata } from '@ez4/storage/library';
import { buildReflection } from '@ez4/project/library';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = getBucketServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
