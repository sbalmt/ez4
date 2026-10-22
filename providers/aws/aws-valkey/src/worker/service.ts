import type { ClientContext } from '@ez4/aws-valkey/client';

import { Client } from '@ez4/aws-valkey/client';

export const makeService = (options: ClientContext) => {
  return () => Client.make(options);
};
