import { getEmailServicesMetadata } from '@ez4/email/library';
import { buildReflection } from '@ez4/project/library';

import { equal } from 'assert/strict';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = getEmailServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
