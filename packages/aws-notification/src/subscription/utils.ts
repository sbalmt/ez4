import type { EntryState } from '@ez4/stateful';
import type { SubscriptionState } from './types.js';

import { SubscriptionServiceType } from './types.js';

export const isSubscriptionState = (resource: EntryState): resource is SubscriptionState => {
  return resource.type === SubscriptionServiceType;
};
