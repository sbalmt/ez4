import { tryRegisterProvider } from '@ez4/aws-common';

import { getSubscriptionHandler } from './handler';
import { SubscriptionServiceType } from './types';

export const registerSubscriptionProvider = () => {
  tryRegisterProvider(SubscriptionServiceType, getSubscriptionHandler());
};
