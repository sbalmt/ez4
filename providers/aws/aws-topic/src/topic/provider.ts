import { tryRegisterProvider } from '@ez4/aws-common';

import { getTopicHandler } from './handler';
import { TopicServiceType } from './types';

export const registerTopicProvider = () => {
  tryRegisterProvider(TopicServiceType, getTopicHandler());
};
