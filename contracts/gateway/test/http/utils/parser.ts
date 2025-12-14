import { equal } from 'assert/strict';

import { getHttpImportsMetadata, getHttpServicesMetadata } from '@ez4/gateway/library';
import { buildReflection } from '@ez4/project/library';

export const parseFile = (fileName: string, errorCount: number) => {
  const sourceFile = `./test/http/input/${fileName}.ts`;

  const reflection = buildReflection([sourceFile]);

  const httpServices = getHttpServicesMetadata(reflection);
  const httpImports = getHttpImportsMetadata(reflection);

  const errors = [...httpServices.errors, ...httpImports.errors];

  equal(errors.length, errorCount);

  return errors;
};
