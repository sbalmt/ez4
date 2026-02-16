import { getAwsClientOptions } from '@ez4/aws-common';
import { SESv2Client } from '@aws-sdk/client-sesv2';

export const getSESClient = () => {
  return new SESv2Client(getAwsClientOptions());
};
