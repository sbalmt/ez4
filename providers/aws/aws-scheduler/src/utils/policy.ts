import type { Arn } from '@ez4/aws-common';

import { getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';

export const buildScheduleArn = (scheduleName: string, region: string, accountId: string) => {
  return `arn:aws:scheduler:${region}:${accountId}:schedule/*/${scheduleName}` as Arn;
};

export const getPolicyDocument = async (prefix: string) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      resourceIds: [`arn:aws:lambda:${region}:${accountId}:function:${prefix}-*`],
      permissions: ['lambda:InvokeFunction']
    },
    {
      resourceIds: [buildScheduleArn(`${prefix}-*`, region, accountId)],
      permissions: [
        'scheduler:GetSchedule',
        'scheduler:CreateSchedule',
        'scheduler:UpdateSchedule',
        'scheduler:DeleteSchedule'
      ]
    },
    {
      resourceIds: [`arn:aws:iam::${accountId}:role/${prefix}-*`],
      permissions: ['iam:PassRole']
    }
  ]);
};
