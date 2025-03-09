import type { ServiceEvent, ConnectResourceEvent, PrepareResourceEvent, DeployOptions } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';

import { isRoleState } from '@ez4/aws-identity';
import { BucketService, isBucketService } from '@ez4/storage/library';
import { linkServiceExtras } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';

import { createBucket } from '../bucket/service.js';
import { createBucketEventFunction } from '../bucket/function/service.js';
import { getFunctionName, getBucketName } from './utils.js';
import { prepareLocalContent } from './content.js';
import { prepareLinkedClient } from './client.js';
import { RoleMissingError } from './errors.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isBucketService(service)) {
    return null;
  }

  return prepareLinkedClient(service, options);
};

export const prepareBucketServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options, context } = event;

  if (!isBucketService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { localPath, autoExpireDays, events, cors } = service;

  const bucketName = await getBucketName(service, options);

  const functionState = getEventsFunction(state, service, role, options);

  const bucketState = createBucket(state, functionState, {
    eventsPath: events?.path,
    bucketName,
    autoExpireDays,
    localPath,
    cors
  });

  context.setServiceState(bucketState, service, options);

  if (localPath) {
    await prepareLocalContent(state, bucketState, localPath);
  }
};

export const connectBucketServices = (event: ConnectResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isBucketService(service) || !service.extras || !service.events) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const handler = service.events.handler;

  const functionName = getFunctionName(service, handler.name, options);
  const functionState = getFunction(state, role, functionName);

  if (functionState) {
    linkServiceExtras(state, functionState.entryId, service.extras);
  }
};

const getEventsFunction = (state: EntryStates, service: BucketService, role: RoleState, options: DeployOptions) => {
  if (!service.events) {
    return undefined;
  }

  const events = service.events;

  const { handler, listener } = service.events;

  const functionName = getFunctionName(service, handler.name, options);
  const functionTimeout = events.timeout ?? 30;
  const functionMemory = events.memory ?? 192;

  return (
    getFunction(state, role, functionName) ??
    createBucketEventFunction(state, role, {
      functionName,
      description: handler.description,
      timeout: functionTimeout,
      memory: functionMemory,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...service.variables
      },
      handler: {
        functionName: handler.name,
        sourceFile: handler.file
      },
      ...(listener && {
        listener: {
          functionName: listener.name,
          sourceFile: listener.file
        }
      })
    })
  );
};
