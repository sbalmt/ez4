import type { EntryState } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { getFunctionBundle } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleTargetFunction = async (parameters: TargetFunctionParameters, connections: EntryState[]) => {
  const { handler, listener, eventSchema, context, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/event.ts'),
    filePrefix: 'scheduler',
    define: {
      ...definitions,
      __EZ4_SCHEMA: eventSchema ? JSON.stringify(eventSchema) : 'undefined'
    },
    handler,
    listener,
    context,
    debug
  });
};
