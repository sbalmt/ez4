import type { EntryState } from '@ez4/stateful';
import type { QueueFunctionParameters } from './types.js';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { bundleFunction } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleQueueFunction = async (
  dependencies: EntryState[],
  parameters: QueueFunctionParameters
) => {
  const { messageSchema } = parameters;

  const definitions = getDefinitionsObject(dependencies);

  return bundleFunction(MappingServiceName, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/function.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    filePrefix: 'sqs',
    define: {
      ...definitions,
      __EZ4_SCHEMA: messageSchema ? JSON.stringify(messageSchema) : 'undefined'
    }
  });
};
