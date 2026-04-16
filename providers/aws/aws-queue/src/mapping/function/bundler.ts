import type { EntryState } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { getFunctionBundle } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export type BundleQueueFunctionParameters = QueueFunctionParameters;

export const bundleQueueFunction = async (parameters: BundleQueueFunctionParameters, connections: EntryState[]) => {
  const { handler, listener, functionName, messageSchema, backoff, timeout, context, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/message.ts'),
    resourceName: functionName,
    filePrefix: 'sqs',
    define: {
      ...definitions,
      __EZ4_SCHEMA: messageSchema ? JSON.stringify(messageSchema) : 'undefined',
      __EZ4_MIN_RETRY: `${backoff?.minDelay ?? timeout}`,
      __EZ4_MAX_RETRY: `${backoff?.maxDelay ?? timeout}`
    },
    handler,
    listener,
    context,
    debug
  });
};
