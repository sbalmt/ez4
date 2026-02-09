import { DescribeVpcsCommand } from '@aws-sdk/client-ec2';
import { getEC2Client } from './client';

export const getDefaultVpcId = async () => {
  const response = await getEC2Client().send(
    new DescribeVpcsCommand({
      Filters: [
        {
          Name: 'isDefault',
          Values: ['true']
        }
      ]
    })
  );

  return response.Vpcs?.[0].VpcId;
};
