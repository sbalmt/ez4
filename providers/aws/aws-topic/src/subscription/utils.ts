import type { EntryState } from '@ez4/state';
import type { SubscriptionState } from './types';

import { SubscriptionServiceType } from './types';

export const isSubscriptionState = (resource: EntryState): resource is SubscriptionState => {
  return resource.type === SubscriptionServiceType;
};
