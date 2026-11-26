import type { EntryState } from '@ez4/state';
import type { QueueFunctionParameters } from './types';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/bundler';
import { pickObject } from '@ez4/utils';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const getBundleTemplateFile = () => {
  return join(__MODULE_PATH, '../lib/message.ts');
};

export type BundleQueueFunctionParameters = QueueFunctionParameters;

export const bundleQueueFunction = async (parameters: BundleQueueFunctionParameters, connections: EntryState[]) => {
  const {
    handler,
    middlewares,
    listener,
    functionName,
    messageSchema,
    backoff,
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
    filePrefix: 'sqs',
    workspacePath,
    projectPrefix,
    projectBranch,
    projectName,
    define: {
      ...definitions,
      __EZ4_SCHEMA: messageSchema ? JSON.stringify(messageSchema) : 'undefined',
      __EZ4_MAX_ATTEMPTS: `${backoff.attempts}`,
      __EZ4_MIN_BACKOFF: `${backoff.minDelay}`,
      __EZ4_MAX_BACKOFF: `${backoff.maxDelay}`
    },
    handler,
    listener,
    middlewares,
    debug
  });
};
