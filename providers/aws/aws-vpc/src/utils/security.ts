import { DescribeSecurityGroupsCommand } from '@aws-sdk/client-ec2';
import { getEC2Client } from './client';

export const getDefaultSecurityGroupId = async (vpcId: string) => {
  const result = await getEC2Client().send(
    new DescribeSecurityGroupsCommand({
      Filters: [
        {
          Name: 'vpc-id',
          Values: [vpcId]
        },
        {
          Name: 'group-name',
          Values: ['default']
        }
      ]
    })
  );

  return result.SecurityGroups?.[0].GroupId;
};
