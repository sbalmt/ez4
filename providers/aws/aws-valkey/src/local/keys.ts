import type { ClientConnection } from '../client/client';

import { Client } from '@ez4/aws-valkey/client';

export const deleteAllKeys = async (connection: ClientConnection) => {
  const client = Client.make({
    identifier: 'local',
    debug: false,
    connection
  });

  try {
    await client.flush();
  } finally {
    Client.dispose('local');
  }
};
