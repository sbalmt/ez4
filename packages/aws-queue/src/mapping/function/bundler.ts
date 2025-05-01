import type { EntryState } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types.js';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { bundleFunction } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export type BundleQueueFunctionParameters = QueueFunctionParameters;

export const bundleQueueFunction = async (dependencies: EntryState[], parameters: BundleQueueFunctionParameters) => {
  const { handler, listener, messageSchema, extras, debug } = parameters;

  const definitions = getDefinitionsObject(dependencies);

  return bundleFunction(MappingServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/message.ts'),
    filePrefix: 'sqs',
    define: {
      ...definitions,
      __EZ4_SCHEMA: messageSchema ? JSON.stringify(messageSchema) : 'undefined'
    },
    handler,
    listener,
    extras,
    debug
  });
};
