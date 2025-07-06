import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

const client = new STSClient({});

export const getRegion = async () => {
  return client.config.region();
};

export const getAccountId = async () => {
  const response = await client.send(new GetCallerIdentityCommand());

  return response.Account!;
};

export const getCallerArn = async () => {
  const response = await client.send(new GetCallerIdentityCommand());

  return response.Arn!;
};
