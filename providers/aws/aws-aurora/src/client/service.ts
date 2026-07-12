import type { Database, Client as DbClient } from '@ez4/database';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { NativeClientConnection } from './drivers/native';
import type { ApiClientConnection } from './drivers/api';

import { PgClient } from '@ez4/pgclient';

import { NativeClientDriver } from './drivers/native';
import { ApiClientDriver } from './drivers/api';
import { ConnectionMode } from './types';

export type NativeClientContext = {
  mode: ConnectionMode.Native;
  connection: NativeClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

export type ApiClientContext = {
  mode: ConnectionMode.Api;
  connection: ApiClientConnection;
  repository: PgTableRepository;
  debug?: boolean;
};

export namespace Client {
  export const make = <T extends Database.Service<any>>(context: NativeClientContext | ApiClientContext): DbClient<T> => {
    const { mode, connection, repository, debug } = context;

    if (mode === ConnectionMode.Api) {
      return PgClient.make({
        driver: new ApiClientDriver(connection),
        repository,
        debug
      });
    }

    return PgClient.make({
      driver: new NativeClientDriver(connection),
      repository,
      debug
    });
  };
}
