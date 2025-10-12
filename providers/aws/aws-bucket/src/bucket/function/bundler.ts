import type { EntryState } from '@ez4/stateful';
import type { BucketEventFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { getFunctionBundle } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleBucketEventFunction = async (parameters: BucketEventFunctionParameters, connections: EntryState[]) => {
  const { extras, debug, handler, listener } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/event.ts'),
    define: definitions,
    filePrefix: 's3',
    handler,
    listener,
    extras,
    debug
  });
};
