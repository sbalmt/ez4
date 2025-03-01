import type { DeployOptions, PrepareResourceEvent } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';

import { isRoleState } from '@ez4/aws-identity';
import { BucketService, isBucketService } from '@ez4/storage/library';
import { getServiceName } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';
import { toKebabCase } from '@ez4/utils';

import { createBucketEventFunction } from '../bucket/function/service.js';
import { createBucket } from '../bucket/service.js';
import { prepareLocalContent } from './content.js';
import { RoleMissingError } from './errors.js';
import { getNewBucketName } from './utils.js';

export const prepareBucketServices = async (event: PrepareResourceEvent) => {
  const { state, service, role, options } = event;

  if (!isBucketService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { globalName, localPath, autoExpireDays, cors } = service;

  const bucketName = globalName ?? (await getNewBucketName(service, options));

  const functionState = getEventsFunction(state, service, role, options);

  const bucketState = createBucket(state, functionState, {
    bucketName,
    autoExpireDays,
    localPath,
    cors
  });

  if (localPath) {
    await prepareLocalContent(state, bucketState, localPath);
  }
};

const getEventsFunction = (
  state: EntryStates,
  service: BucketService,
  role: RoleState,
  options: DeployOptions
) => {
  if (!service.events) {
    return undefined;
  }

  const events = service.events;
  const handler = events.handler;

  const functionName = getFunctionName(service, handler.name, options);

  return (
    getFunction(state, role, functionName) ??
    createBucketEventFunction(state, role, {
      functionName,
      description: handler.description,
      handlerName: handler.name,
      sourceFile: handler.file,
      timeout: events.timeout ?? 15,
      memory: events.memory ?? 192,
      extras: service.extras,
      debug: options.debug,
      variables: {
        ...service.variables
      }
    })
  );
};

export const getFunctionName = (
  service: BucketService,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
