import type { EntryState } from '@ez4/state';
import type { BucketEventFunctionParameters } from './types';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/bundler';
import { pickObject } from '@ez4/utils';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const getBundleTemplateFile = () => {
  return join(__MODULE_PATH, '../lib/event.ts');
};

export const bundleBucketEventFunction = async (parameters: BucketEventFunctionParameters, connections: EntryState[]) => {
  const {
    handler,
    middlewares,
    listener,
    functionName,
    context,
    references,
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
    define: definitions,
    filePrefix: 's3',
    workspacePath,
    projectPrefix,
    projectBranch,
    projectName,
    handler,
    middlewares,
    listener,
    debug
  });
};
