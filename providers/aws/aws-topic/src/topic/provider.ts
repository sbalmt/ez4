import { registerProvider } from '@ez4/aws-common';

import { getTopicHandler } from './handler';
import { TopicServiceType } from './types';

export const registerTopicProvider = () => {
  registerProvider(TopicServiceType, getTopicHandler());
};
