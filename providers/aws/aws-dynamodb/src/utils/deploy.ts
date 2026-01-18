import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { getAwsClientOptions } from '@ez4/aws-common';

export const getDynamoDBClient = () => {
  return new DynamoDBClient(getAwsClientOptions());
};

export const getDynamoDBWaiter = (client: DynamoDBClient) => {
  return {
    minDelay: 15,
    maxWaitTime: 3600,
    maxDelay: 60,
    client
  };
};
