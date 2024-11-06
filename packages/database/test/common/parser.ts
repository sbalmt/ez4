import { getReflection } from '@ez4/project/library';
import { getDatabaseServices } from '@ez4/database/library';

import { equal } from 'assert/strict';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = getReflection([sourceFile]);

  const { errors } = getDatabaseServices(reflection);

  equal(errors.length, errorCount);

  return errors;
};
