import { registerProvider } from '@ez4/aws-common';

import { getSubscriptionHandler } from './handler';
import { SubscriptionServiceType } from './types';

export const registerSubscriptionProvider = () => {
  registerProvider(SubscriptionServiceType, getSubscriptionHandler());
};
