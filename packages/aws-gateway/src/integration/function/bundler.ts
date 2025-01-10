import type { EntryState } from '@ez4/stateful';
import type { IntegrationFunctionParameters } from './types.js';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { bundleFunction } from '@ez4/aws-common';

import { IntegrationServiceName } from '../types.js';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleApiFunction = async (
  dependencies: EntryState[],
  parameters: IntegrationFunctionParameters
) => {
  const { bodySchema, responseSchema } = parameters;
  const { parametersSchema, querySchema } = parameters;
  const { headersSchema, identitySchema } = parameters;

  const definitions = getDefinitionsObject(dependencies);

  return bundleFunction(IntegrationServiceName, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/handler.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    debug: parameters.debug,
    filePrefix: 'api',
    define: {
      ...definitions,
      __EZ4_RESPONSE_SCHEMA: responseSchema ? JSON.stringify(responseSchema) : 'undefined',
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_IDENTITY_SCHEMA: identitySchema ? JSON.stringify(identitySchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_BODY_SCHEMA: bodySchema ? JSON.stringify(bodySchema) : 'undefined'
    }
  });
};
