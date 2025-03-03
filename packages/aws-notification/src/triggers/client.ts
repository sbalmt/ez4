import type { NotificationMessageSchema } from '@ez4/notification/library';
import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { getTopicStateId } from '../topic/utils.js';

export const prepareLinkedClient = (
  topicName: string,
  topicSchema: NotificationMessageSchema
): ExtraSource => {
  const topicEntryId = getTopicStateId(topicName);
  const topicArn = getDefinitionName(topicEntryId, 'topicArn');

  return {
    entryId: topicEntryId,
    constructor: `make(${topicArn}, ${JSON.stringify(topicSchema)})`,
    from: '@ez4/aws-notification/client',
    module: 'Client'
  };
};
