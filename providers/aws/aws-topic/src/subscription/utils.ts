import type { EntryState } from '@ez4/stateful';
import type { SubscriptionState } from './types';

import { SubscriptionServiceType } from './types';

export const isSubscriptionState = (resource: EntryState): resource is SubscriptionState => {
  return resource.type === SubscriptionServiceType;
};
