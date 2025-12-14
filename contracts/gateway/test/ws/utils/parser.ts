import { equal } from 'assert/strict';

import { getWsServicesMetadata } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/ws/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const { errors } = getWsServicesMetadata(reflection);

  equal(errors.length, errorCount);

  return errors;
};
