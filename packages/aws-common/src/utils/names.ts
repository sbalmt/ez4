import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';

import { hash } from 'node:crypto';

const stsClient = new STSClient();

export const getRandomName = async (length: number) => {
  const response = await stsClient.send(new GetCallerIdentityCommand());
  const randomName = hash('sha256', response.Account!).substring(0, Math.min(length, 32));

  return randomName;
};
