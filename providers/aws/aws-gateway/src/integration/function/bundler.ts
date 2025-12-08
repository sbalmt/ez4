import type { EntryState } from '@ez4/stateful';
import type { IntegrationFunctionParameters } from './types';

import { join } from 'node:path';

import { buildServiceContext, getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/aws-common';

import { IntegrationServiceName } from '../types';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export type BundleFunction = (parameters: IntegrationFunctionParameters, connections: EntryState[]) => Promise<string>;

export const bundleRequestFunction = async (parameters: IntegrationFunctionParameters, connections: EntryState[]) => {
  const {
    services,
    handler,
    listener,
    preferences,
    headersSchema,
    parametersSchema,
    querySchema,
    bodySchema,
    identitySchema,
    responseSchema,
    errorsMap,
    context,
    debug
  } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(IntegrationServiceName, {
    context: context && services ? buildServiceContext(context, services) : context,
    templateFile: join(__MODULE_PATH, '../lib/request.ts'),
    filePrefix: 'api',
    define: {
      ...definitions,
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_IDENTITY_SCHEMA: identitySchema ? JSON.stringify(identitySchema) : 'undefined',
      __EZ4_BODY_SCHEMA: bodySchema ? JSON.stringify(bodySchema) : 'undefined',
      __EZ4_RESPONSE_SCHEMA: responseSchema ? JSON.stringify(responseSchema) : 'undefined',
      __EZ4_PREFERENCES: preferences ? JSON.stringify(preferences) : 'undefined',
      __EZ4_ERRORS_MAP: errorsMap ? JSON.stringify(errorsMap) : 'undefined'
    },
    handler,
    listener,
    debug
  });
};

export const bundleConnectionFunction = async (parameters: IntegrationFunctionParameters, connections: EntryState[]) => {
  const { services, handler, listener, preferences, headersSchema, querySchema, identitySchema, context, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(IntegrationServiceName, {
    context: context && services ? buildServiceContext(context, services) : context,
    templateFile: join(__MODULE_PATH, '../lib/connection.ts'),
    filePrefix: 'api',
    define: {
      ...definitions,
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_IDENTITY_SCHEMA: identitySchema ? JSON.stringify(identitySchema) : 'undefined',
      __EZ4_PREFERENCES: preferences ? JSON.stringify(preferences) : 'undefined'
    },
    handler,
    listener,
    debug
  });
};

export const bundleMessageFunction = async (parameters: IntegrationFunctionParameters, connections: EntryState[]) => {
  const { services, handler, listener, preferences, bodySchema, identitySchema, responseSchema, context, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(IntegrationServiceName, {
    context: context && services ? buildServiceContext(context, services) : context,
    templateFile: join(__MODULE_PATH, '../lib/message.ts'),
    filePrefix: 'api',
    define: {
      ...definitions,
      __EZ4_BODY_SCHEMA: bodySchema ? JSON.stringify(bodySchema) : 'undefined',
      __EZ4_IDENTITY_SCHEMA: identitySchema ? JSON.stringify(identitySchema) : 'undefined',
      __EZ4_RESPONSE_SCHEMA: responseSchema ? JSON.stringify(responseSchema) : 'undefined',
      __EZ4_PREFERENCES: preferences ? JSON.stringify(preferences) : 'undefined'
    },
    handler,
    listener,
    debug
  });
};
