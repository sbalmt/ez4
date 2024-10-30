import type { EntryStates } from '@ez4/stateful';
import type { AuthorizerFunctionParameters } from './types.js';

import { join } from 'node:path';

import { bundleFunction } from '@ez4/aws-common';

import { AuthorizerServiceName } from '../types.js';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleApiFunction = async (
  state: EntryStates,
  parameters: AuthorizerFunctionParameters
) => {
  const { headersSchema, parametersSchema, querySchema } = parameters;

  return bundleFunction(AuthorizerServiceName, state, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/authorizer.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    filePrefix: 'auth',
    define: {
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined'
    }
  });
};
