import type { Database, Client as DbClient } from '@ez4/database';

export const runMigration = (client: DbClient<Database.Service>, statements: string[]) => {
  return client.transaction(async (transaction: DbClient<Database.Service>) => {
    for (const statement of statements) {
      await transaction.rawQuery(statement);
    }
  });
};
