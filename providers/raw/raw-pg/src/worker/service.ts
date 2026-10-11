import type { ClientContext } from '@ez4/pgclient/driver';

import { Client } from '@ez4/pgclient/driver';

export const makeService = (options: ClientContext) => {
  return () => Client.make(options);
};
