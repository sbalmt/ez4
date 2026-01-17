import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const getDynamoDBClient = () => {
  return new DynamoDBClient({
    retryMode: 'adaptive',
    maxAttempts: 10
  });
};

export const getDynamoDBWaiter = (client: DynamoDBClient) => {
  return {
    minDelay: 15,
    maxWaitTime: 3600,
    maxDelay: 60,
    client
  };
};
