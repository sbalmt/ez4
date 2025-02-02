import type { NotificationService, NotificationImport } from '@ez4/notification/library';
import type { DeployOptions } from '@ez4/project/library';
import type { RoleState } from '@ez4/aws-identity';
import type { EntryStates } from '@ez4/stateful';
import type { TopicState } from '../topic/types.js';

import { getServiceName, linkServiceExtras } from '@ez4/project/library';
import { getFunction } from '@ez4/aws-function';
import { toKebabCase } from '@ez4/utils';

import { createSubscriptionFunction } from '../subscription/function/service.js';
import { createSubscription } from '../subscription/service.js';

export const prepareSubscriptions = async (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  role: RoleState,
  topicState: TopicState,
  options: DeployOptions
) => {
  for (const subscription of service.subscriptions) {
    const handler = subscription.handler;

    const functionName = getFunctionName(service, handler.name, options);
    const functionTimeout = 30;

    const functionState =
      getFunction(state, role, functionName) ??
      createSubscriptionFunction(state, role, {
        functionName,
        description: handler.description,
        sourceFile: handler.file,
        handlerName: handler.name,
        timeout: functionTimeout,
        memory: subscription.memory,
        messageSchema: service.schema,
        extras: service.extras,
        debug: options.debug,
        variables: {
          ...service.variables,
          ...subscription.variables
        }
      });

    createSubscription(state, topicState, functionState);
  }
};

export const connectSubscriptions = (
  state: EntryStates,
  service: NotificationService | NotificationImport,
  role: RoleState,
  options: DeployOptions
) => {
  if (!service.extras) {
    return;
  }

  for (const { handler } of service.subscriptions) {
    const functionName = getFunctionName(service, handler.name, options);
    const functionState = getFunction(state, role, functionName);

    if (functionState) {
      linkServiceExtras(state, functionState.entryId, service.extras);
    }
  }
};

export const getFunctionName = (
  service: NotificationService | NotificationImport,
  handlerName: string,
  options: DeployOptions
) => {
  return `${getServiceName(service, options)}-${toKebabCase(handlerName)}`;
};
