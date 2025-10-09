import type { ConnectResourceEvent, DeployOptions, PrepareResourceEvent, ServiceEvent } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { EntryStates } from '@ez4/stateful';

import { isCronService, isDynamicCronService } from '@ez4/scheduler/library';
import { getServiceName } from '@ez4/project/library';
import { isRoleState } from '@ez4/aws-identity';

import { createGroup } from '../group/service';
import { createSchedule } from '../schedule/service';
import { connectTarget, prepareScheduleTarget } from './target';
import { prepareLinkedClient } from './client';
import { RoleMissingError } from './errors';

export const prepareLinkedServices = (event: ServiceEvent) => {
  const { service, options, context } = event;

  if (isCronService(service) && service.schema) {
    return prepareLinkedClient(context, service, options);
  }

  return null;
};

export const prepareCronServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, context } = event;

  if (!isCronService(service)) {
    return false;
  }

  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { description, expression, timezone, startDate, endDate, maxAge, maxRetries = 0 } = service;

  const functionState = prepareScheduleTarget(state, service, options, context);
  const groupState = prepareScheduleGroup(state, service, options);

  const scheduleState = createSchedule(state, context.role, functionState, groupState, {
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

  context.setServiceState(scheduleState, service, options);

  return true;
};

export const connectCronResources = (event: ConnectResourceEvent) => {
  const { state, service, options, context } = event;

  if (isCronService(service)) {
    connectTarget(state, service, options, context);
  }
};

const prepareScheduleGroup = (state: EntryStates, service: CronService, options: DeployOptions) => {
  if (!service.group) {
    return undefined;
  }

  const groupName = getServiceName(service.group, options);

  return createGroup(state, {
    tags: options.tags,
    groupName
  });
};
