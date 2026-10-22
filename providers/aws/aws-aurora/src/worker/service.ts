import type { ClientContext as LocalClientContext } from '@ez4/pgclient/driver';
import type { PgTableRepository } from '@ez4/pgclient/library';
import type { Arn } from '@ez4/aws-common';
import type { ClientOptions } from '@ez4/aws-aurora/client';

import { Client as LocalClient } from '@ez4/pgclient/driver';

import { Client as NativeClient } from '@ez4/aws-aurora/client/native';
import { Client as ApiClient } from '@ez4/aws-aurora/client/api';
import { ConnectionMode } from '@ez4/aws-aurora/client';

export type ServiceOptions =
  | {
      local: true;
      defaults?: ClientOptions;
      context: LocalClientContext;
    }
  | {
      local?: false;
      defaults?: ClientOptions;
      context: {
        repository: PgTableRepository;
        debug?: boolean;
        connection: {
          database: string;
          secretArn: Arn;
          resourceArn: Arn;
          endpoint: string;
        };
      };
    };

export const makeService = (options: ServiceOptions) => {
  return () => {
    if (options.local) {
      return LocalClient.make(options.context);
    }

    const { connectionMode } = options.defaults ?? {};
    const { repository, debug, connection } = options.context;
    const { database, secretArn, resourceArn, endpoint } = connection;

    if (connectionMode === ConnectionMode.Native) {
      return NativeClient.make({
        connection: { database, secretArn, endpoint },
        repository,
        debug
      });
    }

    return ApiClient.make({
      connection: { database, secretArn, resourceArn },
      repository,
      debug
    });
  };
};
