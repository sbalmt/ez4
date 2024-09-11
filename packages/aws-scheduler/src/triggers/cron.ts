import type { ServiceResourceEvent } from '@ez4/project/library';

import { isCronService } from '@ez4/scheduler/library';
import { isRole } from '@ez4/aws-identity';

import { createRule } from '../rule/service.js';
import { getRuleName, getTargetName } from './utils.js';
import { createTargetFunction } from '../target/function/service.js';
import { createTarget } from '../target/service.js';

export const prepareCronServices = async (event: ServiceResourceEvent) => {
  const { state, service, options, role } = event;

  if (!isCronService(service)) {
    return;
  }

  if (!role || !isRole(role)) {
    throw new Error(`Execution role for EventBridge is missing.`);
  }

  const { handler, expression, disabled, description } = service;

  const { variables, timeout, memory, extras } = service;

  const ruleState = createRule(state, {
    ruleName: getRuleName(service, options),
    enabled: !disabled,
    description,
    expression
  });

  const functionName = getTargetName(service, handler.name, options);

  const functionState = await createTargetFunction(state, role, {
    functionName,
    description: handler.description,
    sourceFile: handler.file,
    handlerName: handler.name,
    variables: {
      ...variables
    },
    extras,
    timeout,
    memory
  });

  createTarget(state, ruleState, functionState);
};
