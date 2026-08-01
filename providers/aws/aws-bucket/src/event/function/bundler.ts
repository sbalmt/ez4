import type { EntryState } from '@ez4/stateful';
import type { BucketEventFunctionParameters } from './types';

import { join } from 'node:path';

import { MappingServiceName } from '@ez4/aws-function';
import { getDefinitionsObject } from '@ez4/project/library';
import { getFunctionBundle } from '@ez4/aws-common';
import { pickObject } from '@ez4/utils';

// __MODULE_PATH is defined by the package bundler.
declare const __MODULE_PATH: string;

export const bundleBucketEventFunction = async (parameters: BucketEventFunctionParameters, connections: EntryState[]) => {
  const { handler, listener, functionName, context, references, debug } = parameters;

  const definitions = getDefinitionsObject(connections);

  return getFunctionBundle(MappingServiceName, {
    context: context && references ? pickObject(context, references) : context,
    templateFile: join(__MODULE_PATH, '../lib/event.ts'),
    resourceName: functionName,
    define: definitions,
    filePrefix: 's3',
    handler,
    listener,
    debug
  });
};
