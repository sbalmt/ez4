import type { ExtraSource, LinkedServices } from '@ez4/project/library';
import type { EntryState } from '@ez4/stateful';
import type { IntegrationFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/aws-common';

import { IntegrationServiceName } from '../types';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleApiFunction = async (parameters: IntegrationFunctionParameters, connections: EntryState[]) => {
  const {
    services,
    extras,
    debug,
    handler,
    listener,
    preferences,
    headersSchema,
    parametersSchema,
    querySchema,
    bodySchema,
    identitySchema,
    responseSchema,
    errorsMap
  } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(IntegrationServiceName, {
    extras: services && extras ? buildContext(extras, services) : extras,
    templateFile: join(__MODULE_PATH, '../lib/handler.ts'),
    filePrefix: 'api',
    define: {
      ...definitions,
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_BODY_SCHEMA: bodySchema ? JSON.stringify(bodySchema) : 'undefined',
      __EZ4_IDENTITY_SCHEMA: identitySchema ? JSON.stringify(identitySchema) : 'undefined',
      __EZ4_RESPONSE_SCHEMA: responseSchema ? JSON.stringify(responseSchema) : 'undefined',
      __EZ4_PREFERENCES: preferences ? JSON.stringify(preferences) : 'undefined',
      __EZ4_ERRORS_MAP: errorsMap ? JSON.stringify(errorsMap) : 'undefined'
    },
    handler,
    listener,
    debug
  });
};

const buildContext = (extras: Record<string, ExtraSource>, services: LinkedServices) => {
  const context: Record<string, ExtraSource> = {};

  for (const serviceName in services) {
    context[serviceName] = extras[serviceName];
  }

  return context;
};
