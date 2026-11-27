import type { EntryState } from '@ez4/state';
import type { AuthorizerFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/bundler';
import { pickObject } from '@ez4/utils';

import { AuthorizerServiceName } from '../types';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const getBundleTemplateFile = () => {
  return join(__MODULE_PATH, '../lib/authorizer.ts');
};

export const bundleApiFunction = async (exportName: string, parameters: AuthorizerFunctionParameters, connections: EntryState[]) => {
  const {
    authorizer,
    listener,
    functionName,
    headersSchema,
    parametersSchema,
    querySchema,
    preferences,
    context,
    references,
    debug,
    workspacePath,
    entrypointFile,
    projectPrefix,
    projectBranch,
    projectName
  } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(AuthorizerServiceName, {
    context: context && references ? pickObject(context, references) : context,
    templateFile: getBundleTemplateFile(),
    resourceName: functionName,
    filePrefix: 'auth',
    workspacePath,
    entrypointFile,
    exportName,
    projectPrefix,
    projectBranch,
    projectName,
    define: {
      ...definitions,
      __EZ4_HEADERS_SCHEMA: headersSchema ? JSON.stringify(headersSchema) : 'undefined',
      __EZ4_PARAMETERS_SCHEMA: parametersSchema ? JSON.stringify(parametersSchema) : 'undefined',
      __EZ4_QUERY_SCHEMA: querySchema ? JSON.stringify(querySchema) : 'undefined',
      __EZ4_PREFERENCES: preferences ? JSON.stringify(preferences) : 'undefined'
    },
    handler: authorizer,
    listener,
    debug
  });
};
