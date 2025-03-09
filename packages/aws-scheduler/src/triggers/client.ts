import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { getDefinitionName, getServiceName } from '@ez4/project/library';

import { getScheduleState } from '../schedule/utils.js';
import { ScheduleState } from '../schedule/types.js';

export const prepareLinkedClient = (context: EventContext, service: CronService, options: DeployOptions): ExtraSource => {
  const scheduleState = getScheduleState(context, service.name, options);
  const scheduleId = scheduleState.entryId;

  const groupName = getDefinitionName<ScheduleState>(scheduleId, 'groupName');
  const functionArn = getDefinitionName<ScheduleState>(scheduleId, 'functionArn');
  const roleArn = getDefinitionName<ScheduleState>(scheduleId, 'roleArn');

  const { schema, maxRetries, maxAge } = service;

  const clientParameters = JSON.stringify({
    prefix: getServiceName('', options),
    schema,
    defaults: {
      maxRetries,
      maxAge
    }
  });

  return {
    entryIds: [scheduleId],
    constructor: `make(${roleArn}, ${functionArn}, ${groupName}, ${clientParameters})`,
    from: '@ez4/aws-scheduler/client',
    module: 'Client'
  };
};
