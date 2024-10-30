import type { EntryStates } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types.js';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { bundleFunction } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleTargetFunction = async (
  state: EntryStates,
  parameters: TargetFunctionParameters
) => {
  return bundleFunction(MappingServiceName, state, {
    sourceFile: parameters.sourceFile,
    wrapperFile: join(__MODULE_PATH, '../lib/function.ts'),
    handlerName: parameters.handlerName,
    extras: parameters.extras,
    filePrefix: 'event'
  });
};
