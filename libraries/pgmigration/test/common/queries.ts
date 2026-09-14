import type { Database, Client as DbClient } from '@ez4/database';

export const columnMetadata = async (client: DbClient<Database.Service<any>>, table: string, column: string) => {
  return client.rawQuery(
    `SELECT column_name, data_type, character_maximum_length, is_nullable, column_default ` +
      `FROM information_schema.columns WHERE table_schema = current_schema() ` +
      `AND table_name = '${table}' AND column_name = '${column}'`
  );
};

export const tableExists = async (client: DbClient<Database.Service<any>>, table: string) => {
  return client.rawQuery(`SELECT true AS ${table} FROM information_schema.tables WHERE table_name = '${table}'`);
};

export const constraintExists = async (client: DbClient<Database.Service<any>>, constraint: string) => {
  return client.rawQuery(`SELECT true AS ${constraint} FROM information_schema.table_constraints WHERE constraint_name = '${constraint}'`);
};

export const indexExists = async (client: DbClient<Database.Service<any>>, index: string) => {
  return client.rawQuery(`SELECT true AS ${index} FROM pg_class WHERE relkind = 'i' AND relname = '${index}'`);
};
