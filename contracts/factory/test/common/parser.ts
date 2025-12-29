import { equal } from 'assert/strict';

import { getFactoryServicesMetadata } from '@ez4/factory/library';
import { buildReflection } from '@ez4/project/library';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = getFactoryServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
