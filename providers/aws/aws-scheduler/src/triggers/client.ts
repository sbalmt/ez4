import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';
import type { RoleState } from '@ez4/aws-identity';

import { getDefinitionName, getServiceName } from '@ez4/project/library';
import { getAccountId, getRegion, isRoleState } from '@ez4/aws-identity';
import { buildFunctionArn } from '@ez4/aws-function';

import { getScheduleState, getScheduleTargetState } from '../schedule/utils';
import { RoleMissingError } from './errors';
import { getInternalName } from './utils';

export const prepareLinkedClient = async (context: EventContext, service: CronService, options: DeployOptions): Promise<ExtraSource> => {
  if (!context.role || !isRoleState(context.role)) {
    throw new RoleMissingError();
  }

  const { target, schema, group, maxRetries, maxAge } = service;

  const targetInternalName = getInternalName(service, target.handler.name);
  const targetFunctionState = getScheduleTargetState(context, targetInternalName, options);

  const scheduleState = getScheduleState(context, service.name, options);

  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  const functionArn = JSON.stringify(buildFunctionArn(region, accountId, targetFunctionState.parameters.functionName));
  const groupName = group ? JSON.stringify(getServiceName(group, options)) : 'undefined';
  const roleArn = getDefinitionName<RoleState>(context.role.entryId, 'roleArn');

  const clientParameters = JSON.stringify({
    prefix: getServiceName('', options),
    schema,
    defaults: {
      maxRetries,
      maxAge
    }
  });

  return {
    entryIds: scheduleState.dependencies,
    constructor: `make(${roleArn}, ${functionArn}, ${groupName}, ${clientParameters})`,
    from: '@ez4/aws-scheduler/client',
    module: 'Client'
  };
};
