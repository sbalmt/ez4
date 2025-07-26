import type { DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { DescribeTimeToLiveCommand, TimeToLiveStatus } from '@aws-sdk/client-dynamodb';
import { waitFor } from '@ez4/utils';

export const waitForTimeToLive = async (client: DynamoDBClient, tableName: string) => {
  const readyState = new Set<string>([TimeToLiveStatus.ENABLED, TimeToLiveStatus.DISABLED]);

  await waitFor(async () => {
    const status = await getTimeToLiveStatus(client, tableName);

    return !status || readyState.has(status);
  });
};

const getTimeToLiveStatus = async (client: DynamoDBClient, tableName: string) => {
  const response = await client.send(
    new DescribeTimeToLiveCommand({
      TableName: tableName
    })
  );

  return response.TimeToLiveDescription?.TimeToLiveStatus;
};
