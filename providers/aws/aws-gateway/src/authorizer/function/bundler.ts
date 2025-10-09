import type { EntryState } from '@ez4/stateful';
import type { AuthorizerFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/aws-common';

import { AuthorizerServiceName } from '../types';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleApiFunction = async (connections: EntryState[], parameters: AuthorizerFunctionParameters) => {
  const { extras, debug, authorizer, listener, headersSchema, parametersSchema, querySchema, preferences } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(AuthorizerServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/authorizer.ts'),
    filePrefix: 'auth',
    define: {
      ...definitions,
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_PREFERENCES: preferences ? JSON.stringify(preferences) : 'undefined'
    },
    handler: authorizer,
    listener,
    extras,
    debug
  });
};
