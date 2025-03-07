import type { NotificationMessageSchema } from '@ez4/notification/library';
import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { createTopicStateId } from '../topic/utils.js';

export const prepareLinkedClient = (
  topicName: string,
  topicSchema: NotificationMessageSchema
): ExtraSource => {
  const topicStateId = createTopicStateId(topicName);
  const topicArn = getDefinitionName(topicStateId, 'topicArn');

  return {
    entryId: topicStateId,
    constructor: `make(${topicArn}, ${JSON.stringify(topicSchema)})`,
    from: '@ez4/aws-notification/client',
    module: 'Client'
  };
};
