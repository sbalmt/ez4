import type { DeployOptions, ExtraSource } from '@ez4/project/library';
import type { CronService } from '@ez4/scheduler/library';

import { getDefinitionName, getServiceName } from '@ez4/project/library';

import { createScheduleStateId } from '../schedule/utils.js';
import { ScheduleState } from '../schedule/types.js';

export const prepareLinkedClient = (service: CronService, options: DeployOptions): ExtraSource => {
  const scheduleName = getServiceName(service, options);
  const stateId = createScheduleStateId(scheduleName);

  const groupName = getDefinitionName<ScheduleState>(stateId, 'groupName');
  const functionArn = getDefinitionName<ScheduleState>(stateId, 'functionArn');
  const roleArn = getDefinitionName<ScheduleState>(stateId, 'roleArn');

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
    entryId: stateId,
    constructor: `make(${roleArn}, ${functionArn}, ${groupName}, ${clientParameters})`,
    from: '@ez4/aws-scheduler/client',
    module: 'Client'
  };
};
