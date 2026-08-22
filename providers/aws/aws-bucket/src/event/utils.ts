import type { Arn } from '@ez4/aws-common';
import type { EntryState, StepContext } from '@ez4/state';
import type { FunctionState } from '@ez4/aws-function';
import type { BucketEventState } from './types';

import { FunctionDefaults, FunctionServiceType } from '@ez4/aws-function';
import { IncompleteResourceError } from '@ez4/aws-common';

import { BucketEventServiceType } from './types';

export const isBucketEventState = (resource: EntryState): resource is BucketEventState => {
  return resource.type === BucketEventServiceType;
};

export const getBucketEventFunctionAliasArn = (serviceName: string, resourceId: string, context: StepContext): Arn => {
  const entries = context.getDependencies<FunctionState>(FunctionServiceType);
  const entry = entries.find(({ entryId }) => entryId === resourceId);

  const functionArn = entry?.result?.functionArn;

  if (!functionArn) {
    throw new IncompleteResourceError(serviceName, resourceId, 'functionArn');
  }

  return `${functionArn}:${FunctionDefaults.AliasName}`;
};
