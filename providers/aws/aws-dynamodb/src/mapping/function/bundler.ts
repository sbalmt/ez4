import type { EntryState } from '@ez4/stateful';
import type { StreamFunctionParameters } from './types';

import { join } from 'node:path';

import { getDefinitionsObject } from '@ez4/project/library';
import { MappingServiceName } from '@ez4/aws-function';
import { getFunctionBundle } from '@ez4/aws-common';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleStreamFunction = async (dependencies: EntryState[], parameters: StreamFunctionParameters) => {
  const { extras, debug, handler, listener, tableSchema } = parameters;

  const definitions = getDefinitionsObject(dependencies);

  return getFunctionBundle(MappingServiceName, {
    templateFile: join(__MODULE_PATH, '../lib/stream.ts'),
    filePrefix: 'db',
    define: {
      ...definitions,
      __EZ4_SCHEMA: tableSchema ? JSON.stringify(tableSchema) : 'undefined'
    },
    handler,
    listener,
    extras,
    debug
  });
};
