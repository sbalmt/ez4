import { getTopicImportsMetadata, getTopicServicesMetadata } from '@ez4/topic/library';
import { buildReflection } from '@ez4/project/library';

import { equal } from 'assert/strict';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const topicServices = getTopicServicesMetadata(reflection);
  const topicImports = getTopicImportsMetadata(reflection);

  const errors = [...topicServices.errors, ...topicImports.errors];

  equal(errors.length, errorCount);

  return errors;
};
