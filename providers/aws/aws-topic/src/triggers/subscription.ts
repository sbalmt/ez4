import type { TopicService, TopicImport } from '@ez4/topic/library';
import type { DeployOptions, EventContext } from '@ez4/project/library';
import type { EntryStates } from '@ez4/state';
import type { TopicState } from '../topic/types';

import { isLinkedContextVpcRequired, linkServiceContext } from '@ez4/project/library';
import { getFunctionState, tryGetFunctionState } from '@ez4/aws-function';
import { TopicSubscriptionType } from '@ez4/topic/library';
import { InvalidParameterError } from '@ez4/aws-common';
import { isRoleState } from '@ez4/aws-identity';
import { createLogGroup } from '@ez4/aws-logs';
import { getQueueState } from '@ez4/aws-queue';
import { arrayUnique } from '@ez4/utils';

import { SubscriptionServiceName } from '../subscription/types';
import { createSubscriptionFunction } from '../subscription/function/service';
import { createSubscription } from '../subscription/service';
import { getFunctionName, getInternalName } from './utils';
import { RoleMissingError } from './errors';
import { Defaults } from './defaults';

export const prepareSubscriptions = (
  state: EntryStates,
  service: TopicService | TopicImport,
  topicState: TopicState,
  options: DeployOptions,
  context: EventContext
) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case TopicSubscriptionType.Lambda: {
        if (service.fifoMode) {
          throw new InvalidParameterError(SubscriptionServiceName, `lambda subscription not supported for FIFO topics.`);
        }

        const { handler, middlewares = [], listener } = subscription;

        const internalName = getInternalName(service, handler.name);

        let handlerState = tryGetFunctionState(context, internalName, options);

        if (!handlerState) {
          const { defaults, release, tags } = options;

          const subscriptionName = getFunctionName(service, handler.name, options);

          const dependencies = arrayUnique([
            ...context.getDependencyFiles(handler.file),
            ...middlewares.flatMap(({ file }) => context.getDependencyFiles(file))
          ]);

          const {
            runtime = defaults?.runtime ?? Defaults.Runtime,
            architecture = defaults?.architecture ?? Defaults.Architecture,
            logRetention = defaults?.logRetention ?? Defaults.LogRetention,
            logLevel = defaults?.logLevel ?? Defaults.LogLevel,
            memory = defaults?.memory ?? Defaults.Memory,
            timeout = Defaults.Timeout,
            debug = options.debug,
            files,
            vpc
          } = subscription;

          const logGroupState = createLogGroup(state, {
            dependencies: [topicState.entryId],
            groupName: subscriptionName,
            retention: logRetention,
            tags
          });

          const references = handler.references
            ? arrayUnique(handler.references, ...middlewares.map(({ references }) => references), listener?.references)
            : undefined;

          handlerState = createSubscriptionFunction(state, context.role, logGroupState, {
            functionName: subscriptionName,
            eventSchema: service.schema,
            description: handler.summary ?? handler.description,
            variables: [options.variables, service.variables, subscription.variables],
            dependencies: [topicState.entryId],
            workspacePath: options.workspacePath,
            entrypointFile: options.bundle?.entrypointFile,
            projectPrefix: options.prefix,
            projectBranch: options.branchName,
            projectName: options.projectName,
            context: service.context,
            references,
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

        createSubscription(state, topicState, handlerState, {
          fromService: handlerState.parameters.functionName
        });

        break;
      }

      case TopicSubscriptionType.Queue: {
        const queueState = getQueueState(context, subscription.service, options);

        createSubscription(state, topicState, queueState, {
          fromService: queueState.parameters.queueName
        });

        break;
      }
    }
  }
};

export const connectSubscriptions = (
  state: EntryStates,
  service: TopicService | TopicImport,
  options: DeployOptions,
  context: EventContext
) => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const vpcRequired = isLinkedContextVpcRequired(service.context);

  for (const subscription of service.subscriptions) {
    switch (subscription.type) {
      default:
        throw new InvalidParameterError(SubscriptionServiceName, `subscription not supported.`);

      case TopicSubscriptionType.Lambda: {
        const internalName = getInternalName(service, subscription.handler.name);
        const handlerState = getFunctionState(context, internalName, options);

        linkServiceContext(state, handlerState.entryId, service.context);

        if (!handlerState.parameters.vpc) {
          handlerState.parameters.vpc = vpcRequired;
        }

        break;
      }

      case TopicSubscriptionType.Queue: {
        const queueState = getQueueState(context, subscription.service, options);

        linkServiceContext(state, queueState.entryId, service.context);
        break;
      }
    }
  }
};
