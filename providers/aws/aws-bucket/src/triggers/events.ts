import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';
import type { EntryStates } from '@ez4/stateful';
import type { BucketState } from '../bucket/types';

import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isLinkedContextVpcRequired, linkServiceContext } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';

import { attachBucketEvent } from '../event/service';
import { getBucketEventFunctionArn } from '../event/utils';
import { createBucketEventFunction } from '../event/function/service';
import { getFunctionName, getInternalName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareBucketEvents = (
  state: EntryStates,
  service: BucketService,
  bucketState: BucketState,
  options: DeployOptions,
  context: EventContext
) => {
  if (!service.events) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { defaults, release, tags } = options;

  for (const event of service.events) {
    const {
      runtime = defaults?.runtime ?? Defaults.Runtime,
      architecture = defaults?.architecture ?? Defaults.Architecture,
      logRetention = defaults?.logRetention ?? Defaults.LogRetention,
      logLevel = defaults?.logLevel ?? Defaults.LogLevel,
      memory = defaults?.memory ?? Defaults.Memory,
      timeout = Defaults.Timeout,
      debug = options.debug,
      variables,
      listener,
      handler,
      files,
      path,
      vpc
    } = event;

    const internalName = getInternalName(service, handler.name);

    let handlerState = tryGetFunctionState(context, internalName, options);

    if (!handlerState) {
      const eventName = getFunctionName(service, handler.name, options);
      const dependencies = context.getDependencyFiles(handler.file);

      const logGroupState = createLogGroup(state, {
        retention: logRetention,
        groupName: eventName,
        tags
      });

      handlerState = createBucketEventFunction(state, context.role, logGroupState, {
        functionName: eventName,
        description: handler.description,
        context: service.context,
        variables: [options.variables, service.variables, variables],
        handler: {
          sourceFile: handler.file,
          functionName: handler.name,
          module: handler.module,
          dependencies
        },
        listener: listener && {
          functionName: listener.name,
          sourceFile: listener.file,
          module: listener.module
        },
        architecture,
        logLevel,
        runtime,
        release,
        timeout,
        memory,
        files,
        debug,
        tags,
        vpc
      });

      context.setServiceState(internalName, options, handlerState);
    }

    attachBucketEvent(state, bucketState, handlerState, {
      toService: internalName,
      eventGetters: [
        (context) => {
          return {
            functionArn: getBucketEventFunctionArn(service.name, handlerState.entryId, context),
            events: ['s3:ObjectCreated:*', 's3:ObjectRemoved:*'],
            pathPrefix: path
          };
        }
      ]
    });
  }
};

export const connectEvents = (state: EntryStates, service: BucketService, options: DeployOptions, context: EventContext) => {
  if (!service.events) {
    return;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const { handler } of service.events) {
    const internalName = getInternalName(service, handler.name);
    const handlerState = getFunctionState(context, internalName, options);

    linkServiceContext(state, handlerState.entryId, service.context);

    if (!handlerState.parameters.vpc) {
      handlerState.parameters.vpc = isLinkedContextVpcRequired(service.context);
    }
  }
};
