import { registerProvider } from '@ez4/aws-common';

import { getSubscriptionHandler } from './handler.js';
import { SubscriptionServiceType } from './types.js';

export const registerSubscriptionProvider = () => {
  registerProvider(SubscriptionServiceType, getSubscriptionHandler());
};
