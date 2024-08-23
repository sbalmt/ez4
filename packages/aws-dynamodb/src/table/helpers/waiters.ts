import {
  DescribeTimeToLiveCommand,
  DynamoDBClient,
  TimeToLiveStatus
} from '@aws-sdk/client-dynamodb';

import { waitFor } from '@ez4/utils';

const client = new DynamoDBClient({});

const getTimeToLiveStatus = async (tableName: string) => {
  const response = await client.send(
    new DescribeTimeToLiveCommand({
      TableName: tableName
    })
  );

  return response.TimeToLiveDescription?.TimeToLiveStatus;
};

export const waitForTimeToLive = async (eventId: string) => {
  const readyState = new Set<string>([TimeToLiveStatus.ENABLED, TimeToLiveStatus.DISABLED]);

  await waitFor(async () => {
    const state = await getTimeToLiveStatus(eventId);

    return !state || readyState.has(state);
  });
};
