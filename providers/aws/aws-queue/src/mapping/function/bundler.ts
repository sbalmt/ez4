import type { EntryState } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/aws-common';
import { pickObject } from '@ez4/utils';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export type BundleQueueFunctionParameters = QueueFunctionParameters;

export const bundleQueueFunction = async (parameters: BundleQueueFunctionParameters, connections: EntryState[]) => {
  const { handler, listener, functionName, messageSchema, backoff, context, references, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    context: context && references ? pickObject(context, references) : context,
    templateFile: join(__MODULE_PATH, '../lib/message.ts'),
    resourceName: functionName,
    filePrefix: 'sqs',
    define: {
      ...definitions,
      __EZ4_SCHEMA: messageSchema ? JSON.stringify(messageSchema) : 'undefined',
      __EZ4_MAX_ATTEMPTS: `${backoff.attempts}`,
      __EZ4_MIN_BACKOFF: `${backoff.minDelay}`,
      __EZ4_MAX_BACKOFF: `${backoff.maxDelay}`
    },
    handler,
    listener,
    debug
  });
};
