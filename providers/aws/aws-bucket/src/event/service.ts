import type { FunctionState } from '@ez4/aws-function';
import type { EntryState, EntryStates } from '@ez4/stateful';
import type { BucketEventParameters, BucketEventState } from './types';
import type { BucketState } from '../bucket/types';

import { createPermission, getPermission } from '@ez4/aws-function';
import { attachEntry, tryLinkEntryDependency } from '@ez4/stateful';
import { hashData } from '@ez4/utils';

import { buildBucketArn } from '../utils/policy';
import { BucketEventServiceType } from './types';
import { isBucketEventState } from './utils';

export const createBucketEvent = <E extends EntryState>(
  state: EntryStates<E>,
  bucketState: BucketState,
  functionState: FunctionState,
  parameters: BucketEventParameters
) => {
  const eventId = hashData(BucketEventServiceType, bucketState.entryId);

  const eventState = attachEntry<E | BucketEventState, BucketEventState>(state, {
    type: BucketEventServiceType,
    entryId: eventId,
    dependencies: [bucketState.entryId, functionState.entryId],
    parameters
  });

  const { bucketName } = bucketState.parameters;

  createPermission(state, bucketState, functionState, {
    fromService: bucketName,
    getPermission: () => {
      return {
        sourceArn: buildBucketArn(bucketName),
        principal: 's3.amazonaws.com'
      };
    }
  });

  return eventState;
};

export const getBucketEvent = <E extends EntryState>(state: EntryStates<E>, bucketState: BucketState) => {
  const eventId = hashData(BucketEventServiceType, bucketState.entryId);

  const eventState = state[eventId];

  if (eventState && isBucketEventState(eventState)) {
    return eventState;
  }

  return null;
};

export const attachBucketEvent = <E extends EntryState>(
  state: EntryStates<E>,
  bucketState: BucketState,
  functionState: FunctionState,
  parameters: BucketEventParameters
) => {
  const eventState = getBucketEvent(state, bucketState);

  if (!eventState) {
    return createBucketEvent(state, bucketState, functionState, parameters);
  }

  const { bucketName } = bucketState.parameters;

  eventState.parameters.fromPath += `, ${parameters.fromPath}`;
  eventState.parameters.toService += `, ${parameters.toService}`;
  eventState.parameters.eventGetters.push(...parameters.eventGetters);

  tryLinkEntryDependency(state, eventState.entryId, functionState.entryId);

  if (!getPermission(state, bucketState, functionState)) {
    createPermission(state, bucketState, functionState, {
      fromService: bucketName,
      getPermission: () => {
        return {
          sourceArn: buildBucketArn(bucketName),
          principal: 's3.amazonaws.com'
        };
      }
    });
  }

  return eventState;
};
