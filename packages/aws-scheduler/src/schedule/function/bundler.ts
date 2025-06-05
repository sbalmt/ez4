import type { EntryState } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types.js';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { getFunctionBundle } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleTargetFunction = async (
  dependencies: EntryState[],
  parameters: TargetFunctionParameters
) => {
  const { extras, debug, handler, listener, eventSchema } = parameters;

  const definitions = getDefinitionsObject(dependencies);

  return getFunctionBundle(MappingServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/event.ts'),
    filePrefix: 'scheduler',
    define: {
      ...definitions,
      __EZ4_SCHEMA: eventSchema ? JSON.stringify(eventSchema) : 'undefined'
    },
    handler,
    listener,
    extras,
    debug
  });
};
