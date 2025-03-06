import type { EntryState } from '@ez4/stateful';
import type { AuthorizerFunctionParameters } from './types.js';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { bundleFunction } from '@ez4/aws-common';

import { AuthorizerServiceName } from '../types.js';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleApiFunction = async (
  dependencies: EntryState[],
  parameters: AuthorizerFunctionParameters
) => {
  const { extras, debug, authorizer, listener, headersSchema, parametersSchema, querySchema } =
    parameters;

  const definitions = getDefinitionsObject(dependencies);

  return bundleFunction(AuthorizerServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/authorizer.ts'),
    filePrefix: 'auth',
    define: {
      ...definitions,
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined'
    },
    handler: authorizer,
    listener,
    extras,
    debug
  });
};
