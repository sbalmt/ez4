import type { EntryState, StepContext } from '@ez4/stateful';
import type { FunctionState } from '@ez4/aws-function';
import type { BucketEventState } from './types';

import { IncompleteResourceError } from '@ez4/aws-common';
import { FunctionServiceType } from '@ez4/aws-function';

import { BucketEventServiceType } from './types';

export const isBucketEventState = (resource: EntryState): resource is BucketEventState => {
  return resource.type === BucketEventServiceType;
};

export const getBucketEventFunctionArn = (serviceName: string, resourceId: string, context: StepContext) => {
  const functionStates = context.getDependencies<FunctionState>(FunctionServiceType);

  const functionState = functionStates.find((functionState) => functionState.entryId === resourceId);

  if (!functionState?.result?.functionArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'functionArn');
  }

  return functionState.result.functionArn;
};
