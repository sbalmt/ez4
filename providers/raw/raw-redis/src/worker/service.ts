import type { ClientContext } from '../client/types';

import { Client } from '../client/service';

export const makeService = (options: ClientContext) => {
  return () => Client.make(options);
};
