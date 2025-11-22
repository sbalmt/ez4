import type { Db } from './aurora';

import { DatabaseRunner } from '@ez4/local-database/run';

import { randomUUID } from 'node:crypto';

const client = DatabaseRunner.getClient<Db>('db');

const now = new Date().toISOString();

await client.items.insertMany({
  data: [
    {
      id: randomUUID(),
      name: 'First',
      description: 'First item description',
      created_at: now,
      updated_at: now
    },
    {
      id: randomUUID(),
      name: 'Second',
      description: 'Second item description',
      created_at: now,
      updated_at: now
    }
  ]
});
