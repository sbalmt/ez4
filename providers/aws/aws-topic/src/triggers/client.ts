import type { TopicImport, TopicService } from '@ez4/topic/library';
import type { DeployOptions, EventContext, ExtraSource } from '@ez4/project/library';
import type { TopicState } from '../topic/types.js';

import { getDefinitionName } from '@ez4/project/library';

import { getTopicState } from '../topic/utils.js';

export const prepareLinkedClient = (context: EventContext, service: TopicService | TopicImport, options: DeployOptions): ExtraSource => {
  const topicState = getTopicState(context, service.name, options);
  const topicId = topicState.entryId;

  const topicArn = getDefinitionName<TopicState>(topicId, 'topicArn');

  const fifoMode = JSON.stringify(service.fifoMode ?? null);
  const schema = JSON.stringify(service.schema);

  return {
    entryIds: [topicId],
    constructor: `make(${topicArn}, ${schema}, ${fifoMode})`,
    from: '@ez4/aws-topic/client',
    module: 'Client'
  };
};
