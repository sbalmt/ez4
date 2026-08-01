import type { EntryState } from '@ez4/stateful';
import type { TargetFunctionParameters } from './types';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/aws-common';
import { pickObject } from '@ez4/utils';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleTargetFunction = async (parameters: TargetFunctionParameters, connections: EntryState[]) => {
  const { handler, listener, functionName, eventSchema, context, references, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    context: context && references ? pickObject(context, references) : context,
    templateFile: join(__MODULE_PATH, '../lib/event.ts'),
    resourceName: functionName,
    filePrefix: 'scheduler',
    define: {
      ...definitions,
      __EZ4_SCHEMA: eventSchema ? JSON.stringify(eventSchema) : 'undefined'
    },
    handler,
    listener,
    debug
  });
};
