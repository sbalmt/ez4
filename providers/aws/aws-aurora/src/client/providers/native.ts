import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { NativeClientConnection } from '../drivers/native';

import { PgClient } from '@ez4/pgclient';

import { NativeClientDriver } from '../drivers/native';

export type NativeClientContext = {
  connection: NativeClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service<any>>(context: NativeClientContext): DbClient<T> => {
    const { connection, repository, debug } = context;

    return PgClient.make({
      driver: new NativeClientDriver(connection),
      repository,
      debug
    });
  };
}
