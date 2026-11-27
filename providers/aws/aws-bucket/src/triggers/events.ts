import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { BucketService } from '@ez4/storage/library';
import type { EntryStates } from '@ez4/state';
import type { BucketState } from '../bucket/types';

import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { isLinkedContextVpcRequired, linkServiceContext } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';
import { BucketEventType } from '@ez4/storage';
import { createLogGroup } from '@ez4/aws-logs';
import { arrayUnique } from '@ez4/utils';

import { attachBucketEvent } from '../event/service';
import { getBucketEventFunctionAliasArn } from '../event/utils';
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
      triggers = [],
      variables,
      handler,
      middlewares = [],
      listener,
      files,
      path,
      vpc
    } = event;

    const internalName = getInternalName(service, handler.name);

    let handlerState = tryGetFunctionState(context, internalName, options);

    if (!handlerState) {
      const eventName = getFunctionName(service, handler.name, options);

      const dependencies = arrayUnique([
        ...context.getDependencyFiles(handler.file),
        ...middlewares.flatMap(({ file }) => context.getDependencyFiles(file))
      ]);

      const logGroupState = createLogGroup(state, {
        dependencies: [bucketState.entryId],
        retention: logRetention,
        groupName: eventName,
        tags
      });

      const references = handler.references
        ? arrayUnique(handler.references, ...middlewares.map(({ references }) => references), listener?.references)
        : undefined;

      handlerState = createBucketEventFunction(state, context.role, logGroupState, {
        functionName: eventName,
        description: handler.summary ?? handler.description,
        variables: [options.variables, service.variables, variables],
        dependencies: [bucketState.entryId],
        workspacePath: options.workspacePath,
        entrypointFile: options.bundle?.entrypointFile,
        projectPrefix: options.prefix,
        projectBranch: options.branchName,
        projectName: options.projectName,
        context: service.context,
        handler: {
          sourceFile: handler.file,
          functionName: handler.name,
          module: handler.module,
          dependencies
        },
        middlewares: middlewares.map((middleware) => ({
          functionName: middleware.name,
          sourceFile: middleware.file,
          module: middleware.module
        })),
        listener: listener && {
          functionName: listener.name,
          sourceFile: listener.file,
          module: listener.module
        },
        references,
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

    if (!triggers.length) {
      triggers.push(BucketEventType.Create, BucketEventType.Delete);
    }

    const events = triggers.map((trigger) => {
      return trigger === BucketEventType.Create ? 's3:ObjectCreated:*' : 's3:ObjectRemoved:*';
    });

    attachBucketEvent(state, bucketState, handlerState, {
      toService: internalName,
      fromPath: path,
      triggers,
      eventGetters: [
        (context) => {
          return {
            functionArn: getBucketEventFunctionAliasArn(service.name, handlerState.entryId, context),
            events,
            path
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
