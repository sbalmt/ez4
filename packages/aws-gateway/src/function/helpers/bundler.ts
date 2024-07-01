import type { FunctionParameters } from '../types.js';

import { join } from 'node:path';

import { bundleFunction } from '@ez4/aws-common';

import { FunctionServiceName } from '../types.js';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleApiFunction = async (parameters: FunctionParameters) => {
  const { querySchema, parametersSchema, bodySchema } = parameters;

  return bundleFunction(FunctionServiceName, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/function.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    filePrefix: 'api',
    define: {
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_BODY_SCHEMA: bodySchema ? JSON.stringify(bodySchema) : 'undefined'
    }
  });
};
