import type { DeployOptions } from '@ez4/project/library';
import type { EntryStates } from '@ez4/state';

import { createPolicy, tryGetPolicy, getAccountId, getRegion, createPolicyDocument } from '@ez4/aws-identity';
import { getServiceName } from '@ez4/project/library';

export const getPolicyDocument = async (prefix: string) => {
  const [region, accountId] = await Promise.all([getRegion(), getAccountId()]);

  return createPolicyDocument([
    {
      permissions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
      resourceIds: [`arn:aws:logs:${region}:${accountId}:log-group:${prefix}-*:*`]
    },
    {
      permissions: ['ec2:CreateNetworkInterface', 'ec2:DescribeNetworkInterfaces', 'ec2:DeleteNetworkInterface'],
      resourceIds: ['*']
    }
  ]);
};

export const createExecutionPolicy = async (state: EntryStates, options: DeployOptions) => {
  const policyPrefix = getServiceName('', options);
  const policyName = `${policyPrefix}-lambda-policy`;

  return (
    tryGetPolicy(state, policyName) ??
    createPolicy(state, {
      tags: options.tags,
      policyDocument: await getPolicyDocument(policyPrefix),
      policyName
    })
  );
};
