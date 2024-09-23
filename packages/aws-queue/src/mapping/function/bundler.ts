import type { QueueFunctionParameters } from './types.js';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { bundleFunction } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleQueueFunction = async (parameters: QueueFunctionParameters) => {
  const { messageSchema, sourceFile, handlerName, extras } = parameters;

  const define = {
    __EZ4_SCHEMA: messageSchema ? JSON.stringify(messageSchema) : 'undefined'
  };

  return bundleFunction(MappingServiceName, {
    wrapperFile: join(__MODULE_PATH, '../lib/function.ts'),
    filePrefix: 'sqs',
    handlerName,
    sourceFile,
    extras,
    define
  });
};
