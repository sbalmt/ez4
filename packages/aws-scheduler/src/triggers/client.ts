import type { DeployOptions, ExtraSource } from '@ez4/project/library';
import type { CronEventSchema } from '@ez4/scheduler/library';
import type { ScheduleEvent } from '@ez4/scheduler';

import { getDefinitionName, getServiceName } from '@ez4/project/library';

import { createScheduleStateId } from '../schedule/utils.js';

export const prepareLinkedClient = (
  scheduleName: string,
  eventSchema: CronEventSchema,
  options: DeployOptions,
  defaults: Pick<ScheduleEvent<never>, 'maxRetries' | 'maxAge'>
): ExtraSource => {
  const scheduleEntryId = createScheduleStateId(scheduleName);

  const groupName = getDefinitionName(scheduleEntryId, 'groupName');
  const functionArn = getDefinitionName(scheduleEntryId, 'functionArn');
  const roleArn = getDefinitionName(scheduleEntryId, 'roleArn');

  const clientParameters = {
    prefix: getServiceName('', options),
    schema: eventSchema,
    defaults
  };

  return {
    entryId: scheduleEntryId,
    constructor: `make(${roleArn}, ${functionArn}, ${groupName}, ${JSON.stringify(clientParameters)})`,
    from: '@ez4/aws-scheduler/client',
    module: 'Client'
  };
};
