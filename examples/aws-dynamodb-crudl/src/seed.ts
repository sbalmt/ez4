import type { Db } from './dynamo';

import { DatabaseRunner } from '@ez4/local-database/run';

import { randomUUID } from 'node:crypto';

import { ItemType } from './schemas/item';

const client = DatabaseRunner.getClient<Db>('db');

const now = new Date().toISOString();

await client.items.insertMany({
  data: [
    {
      id: randomUUID(),
      name: 'First',
      description: 'First item description',
      type: ItemType.TypeA,
      created_at: now,
      updated_at: now
    },
    {
      id: randomUUID(),
      name: 'Second',
      description: 'Second item description',
      type: ItemType.TypeB,
      created_at: now,
      updated_at: now
    }
  ]
});
