import { DescribeSubnetsCommand } from '@aws-sdk/client-ec2';
import { getEC2Client } from './client';

export const getDefaultSubnetIds = async (vpcId: string) => {
  const response = await getEC2Client().send(
    new DescribeSubnetsCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [vpcId]
        }
      ]
    })
  );

  return response.Subnets?.map((subnet) => subnet.SubnetId!);
};
