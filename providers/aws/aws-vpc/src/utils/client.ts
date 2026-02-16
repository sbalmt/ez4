import { getAwsClientOptions } from '@ez4/aws-common';
import { EC2Client } from '@aws-sdk/client-ec2';

export const getEC2Client = () => {
  return new EC2Client(getAwsClientOptions());
};
