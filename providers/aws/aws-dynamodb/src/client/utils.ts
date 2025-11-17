import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export type ClientInstanceOptions = {
  endpoint: string;
};

export const getClientInstance = (options?: ClientInstanceOptions) => {
  return DynamoDBDocumentClient.from(
    new DynamoDBClient({
      endpoint: options?.endpoint
    }),
    {
      marshallOptions: {
        removeUndefinedValues: true
      }
    }
  );
};
