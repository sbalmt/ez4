import type { ExtraSource } from '@ez4/project/library';
import type { CronEventSchema } from '@ez4/scheduler/library';

import { getDefinitionName } from '@ez4/project/library';

import { getScheduleStateId } from '../schedule/utils.js';

export const prepareLinkedService = (
  scheduleName: string,
  eventSchema: CronEventSchema
): ExtraSource | null => {
  const scheduleEntryId = getScheduleStateId(scheduleName);
  const functionArn = getDefinitionName(scheduleEntryId, 'functionArn');
  const roleArn = getDefinitionName(scheduleEntryId, 'roleArn');

  return {
    entryId: scheduleEntryId,
    constructor: `make(${scheduleName}, ${roleArn}, ${functionArn}, ${JSON.stringify(eventSchema)})`,
    module: 'Client',
    from: '@ez4/aws-schedule/client'
  };
};
