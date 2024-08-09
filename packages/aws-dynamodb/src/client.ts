import type { Database } from '@ez4/database';

import { DynamoDBDocumentClient, ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export namespace Client {
  export const make = <T extends Database.Schema>(): Database.Client<T> => {
    return new (class {
      async rawQuery(query: string, values: unknown[]) {
        const result = await docClient.send(
          new ExecuteStatementCommand({
            Statement: query,
            Parameters: values,
            ConsistentRead: true
          })
        );

        return result.Items ?? [];
      }
    })();
  };
}
