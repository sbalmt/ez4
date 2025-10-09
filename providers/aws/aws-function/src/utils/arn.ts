import type { Arn } from '@ez4/aws-common';

export const buildFunctionArn = (region: string, accountId: string, functionName: string): Arn => {
  return `arn:aws:lambda:${region}:${accountId}:function:${functionName}`;
};
