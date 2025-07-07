import { registerProvider } from '@ez4/aws-common';

import { getTopicHandler } from './handler.js';
import { TopicServiceType } from './types.js';

export const registerTopicProvider = () => {
  registerProvider(TopicServiceType, getTopicHandler());
};
