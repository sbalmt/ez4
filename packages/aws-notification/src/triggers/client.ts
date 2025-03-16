import type { NotificationImport, NotificationService } from '@ez4/notification/library';
import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';

import { getDefinitionName } from '@ez4/project/library';

import { getTopicState } from '../topic/utils.js';
import { TopicState } from '../topic/types.js';

export const prepareLinkedClient = (
  context: EventContext,
  service: NotificationService | NotificationImport,
  options: DeployOptions
): ExtraSource => {
  const topicState = getTopicState(context, service.name, options);
  const topicId = topicState.entryId;

  const topicArn = getDefinitionName<TopicState>(topicId, 'topicArn');

  const fifoMode = JSON.stringify(service.fifoMode ?? null);
  const schema = JSON.stringify(service.schema);

  return {
    entryIds: [topicId],
    constructor: `make(${topicArn}, ${schema}, ${fifoMode})`,
    from: '@ez4/aws-notification/client',
    module: 'Client'
  };
};
