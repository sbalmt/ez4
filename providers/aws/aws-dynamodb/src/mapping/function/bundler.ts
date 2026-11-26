import type { EntryState } from '@ez4/state';
import type { StreamFunctionParameters } from './types';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/bundler';
import { pickObject } from '@ez4/utils';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const getBundleTemplateFile = () => {
  return join(__MODULE_PATH, '../lib/stream.ts');
};

export const bundleStreamFunction = async (parameters: StreamFunctionParameters, connections: EntryState[]) => {
  const {
    handler,
    middlewares,
    listener,
    functionName,
    tableSchema,
    references,
    context,
    debug,
    workspacePath,
    projectPrefix,
    projectBranch,
    projectName
  } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    context: context && references ? pickObject(context, references) : context,
    templateFile: getBundleTemplateFile(),
    resourceName: functionName,
    filePrefix: 'db',
    workspacePath,
    projectPrefix,
    projectBranch,
    projectName,
    define: {
      ...definitions,
      __EZ4_SCHEMA: tableSchema ? JSON.stringify(tableSchema) : 'undefined'
    },
    handler,
    middlewares,
    listener,
    debug
  });
};
