import type { ClientContext } from '@ez4/raw-redis/client';

import { Client } from '@ez4/raw-redis/client';

export const makeService = (options: ClientContext) => {
  return () => Client.make(options);
};
