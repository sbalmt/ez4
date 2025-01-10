import type { PrepareResourceEvent } from '@ez4/project/library';

import { getServiceName } from '@ez4/project/library';
import { isCronService } from '@ez4/scheduler/library';
import { isRoleState } from '@ez4/aws-identity';

import { createTargetFunction } from '../schedule/function/service.js';
import { createSchedule } from '../schedule/service.js';
import { getTargetName } from './utils.js';

export const prepareCronServices = async (event: PrepareResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isCronService(service)) {
    return;
  }

  if (!role || !isRoleState(role)) {
    throw new Error(`Execution role for EventBridge Scheduler is missing.`);
  }

  const { handler, timeout, memory, variables } = service.target;

  const functionName = getTargetName(service, handler.name, options);

  const functionState = await createTargetFunction(state, role, {
    functionName,
    description: handler.description,
    sourceFile: handler.file,
    handlerName: handler.name,
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
  const { maxRetryAttempts = 0, maxEventAge } = service;

  createSchedule(state, role, functionState, {
    scheduleName: getServiceName(service, options),
    enabled: !service.disabled,
    description,
    expression,
    timezone,
    startDate,
    endDate,
    maxRetryAttempts,
    maxEventAge
  });
};
