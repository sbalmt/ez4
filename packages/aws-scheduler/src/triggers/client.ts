import type { DeployOptions, ExtraSource } from '@ez4/project/library';
import type { ScheduleOptions } from '@ez4/scheduler';
import type { ClientEventSchema } from '../client.js';

import { getDefinitionName, getServiceName } from '@ez4/project/library';

import { getScheduleStateId } from '../schedule/utils.js';

export const prepareLinkedService = (
  scheduleName: string,
  eventSchema: ClientEventSchema,
  options: DeployOptions,
  defaults: ScheduleOptions
): ExtraSource | null => {
  const scheduleEntryId = getScheduleStateId(scheduleName);

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
    from: '@ez4/aws-scheduler/client',
    constructor: `make(${roleArn}, ${functionArn}, ${groupName}, ${JSON.stringify(clientParameters)})`,
    module: 'Client'
  };
};
