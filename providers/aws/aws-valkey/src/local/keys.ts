import type { ClientConnection } from '../client/client';

import { Client } from '../client/service';

export const deleteAllKeys = async (connection: ClientConnection) => {
  const client = Client.make({
    debug: false,
    connection
  });

  await client.flush();
};
