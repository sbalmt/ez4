import type { Arn } from '@ez4/aws-common';

import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { ClientDriver, createPool } from '@ez4/pgclient';

export type NativeClientConnection = {
  secretArn: Arn;
  endpoint: string;
  database: string;
};

export class NativeClientDriver extends ClientDriver {
  #connection: NativeClientConnection;

  constructor(connection: NativeClientConnection) {
    super();

    this.#connection = connection;
  }

  async getConnection() {
    if (!this.pool) {
      this.pool = await createAuroraPool(this.#connection);
    }

    return super.getConnection();
  }
}

const createAuroraPool = async (connection: NativeClientConnection) => {
  const { database, secretArn, endpoint: host } = connection;

  const client = new SecretsManagerClient();

  const response = await client.send(new GetSecretValueCommand({ SecretId: secretArn }));

  const { username: user, password } = JSON.parse(response.SecretString!);

  return createPool({
    host,
    database,
    password,
    user
  });
};
