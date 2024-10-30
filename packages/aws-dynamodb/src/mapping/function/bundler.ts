import type { EntryStates } from '@ez4/stateful';
import type { StreamFunctionParameters } from './types.js';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { bundleFunction } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleStreamFunction = async (
  state: EntryStates,
  parameters: StreamFunctionParameters
) => {
  const { tableSchema } = parameters;

  return bundleFunction(MappingServiceName, state, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/function.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    filePrefix: 'db',
    define: {
      __EZ4_SCHEMA: tableSchema ? JSON.stringify(tableSchema) : 'undefined'
    }
  });
};
