import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import type {
  ConnectResourceEvent,
  DeployOptions,
  PrepareResourceEvent,
  ServiceEvent
} from '@ez4/project/library';

import { getServiceName, linkServiceExtras } from '@ez4/project/library';
import { isCronService, isDynamicCronService } from '@ez4/scheduler/library';
import { getFunction } from '@ez4/aws-function';
import { isRoleState } from '@ez4/aws-identity';

import { createGroup } from '../group/service.js';
import { createSchedule } from '../schedule/service.js';
import { createTargetFunction } from '../schedule/function/service.js';
import { RoleMissingError, TargetHandlerMissingError } from './errors.js';
import { prepareLinkedClient } from './client.js';
import { getTargetName } from './utils.js';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options } = event;

  if (!isCronService(service) || !service.schema) {
    return null;
  }

  const scheduleName = getServiceName(service, options);

  const { maxRetries, maxAge } = service;

  return prepareLinkedClient(scheduleName, service.schema, options, {
    maxRetries,
    maxAge
  });
};

export const prepareCronServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isCronService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { handler, timeout, memory, variables } = service.target;

  const functionName = getTargetName(service, handler.name, options);

  const functionState = createTargetFunction(state, role, {
    functionName,
    description: handler.description,
    sourceFile: handler.file,
    handlerName: handler.name,
    eventSchema: service.schema,
    extras: service.extras,
    debug: options.debug,
    variables: {
      ...service.variables,
      ...variables
    },
    timeout,
    memory
  });

  const { description, expression, timezone, startDate, endDate } = service;

  const { maxRetries = 0, maxAge } = service;

  const groupState = getScheduleGroup(state, service, options);

  createSchedule(state, role, functionState, groupState, {
    scheduleName: getServiceName(service, options),
    dynamic: isDynamicCronService(service),
    enabled: !service.disabled,
    description,
    expression,
    timezone,
    startDate,
    endDate,
    maxRetries,
    maxAge
  });
};

export const connectCronResources = (event: ConnectResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isCronService(service) || !service.extras) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new RoleMissingError();
  }

  const { handler } = service.target;

  const functionName = getTargetName(service, handler.name, options);
  const functionState = getFunction(state, role, functionName);

  if (!functionState) {
    throw new TargetHandlerMissingError(functionName);
  }

  linkServiceExtras(state, functionState.entryId, service.extras);
};

const getScheduleGroup = (state: EntryStates, service: CronService, options: DeployOptions) => {
  if (!service.group) {
    return undefined;
  }

  const groupName = getServiceName(service.group, options);

  return createGroup(state, {
    groupName
  });
};
