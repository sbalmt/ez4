import type { FunctionParameters } from '../types.js';

import { join } from 'node:path';

import { bundleFunction } from '@ez4/aws-common';

import { FunctionServiceName } from '../types.js';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleQueueFunction = async (parameters: FunctionParameters) => {
  const { tableSchema } = parameters;

  return bundleFunction(FunctionServiceName, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/function.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    filePrefix: 'db',
    define: {
      __EZ4_SCHEMA: tableSchema ? JSON.stringify(tableSchema) : 'undefined'
    }
  });
};
