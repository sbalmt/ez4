import { getTopicImportsMetadata, getTopicServicesMetadata } from '@ez4/topic/library';
import { buildReflection } from '@ez4/project/library';

import { equal } from 'assert/strict';

export const parseFile = (fileName: string, errorCount: number, isImport?: boolean) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = isImport ? getTopicImportsMetadata(reflection) : getTopicServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
