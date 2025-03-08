import type { NotificationMessageSchema } from '@ez4/notification/library';
import type { ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { createTopicStateId } from '../topic/utils.js';
import { TopicState } from '../topic/types.js';

export const prepareLinkedClient = (topicName: string, topicSchema: NotificationMessageSchema): ExtraSource => {
  const stateId = createTopicStateId(topicName);

  const topicArn = getDefinitionName<TopicState>(stateId, 'topicArn');

  const schema = JSON.stringify(topicSchema);

  return {
    entryId: stateId,
    constructor: `make(${topicArn}, ${schema})`,
    from: '@ez4/aws-notification/client',
    module: 'Client'
  };
};
