import { getAwsClientOptions, getAwsClientWaiter } from '@ez4/aws-common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const getDynamoDBClient = () => {
  return new DynamoDBClient(getAwsClientOptions());
};

export const getDynamoDBWaiter = (client: DynamoDBClient) => {
  return {
    ...getAwsClientWaiter(),
    client
  };
};
