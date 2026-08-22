import type { Arn } from '@ez4/aws-common';

import { FunctionDefaults } from './defaults';

export const buildFunctionArn = (region: string, accountId: string, functionName: string): Arn => {
  return `arn:aws:lambda:${region}:${accountId}:function:${functionName}`;
};

export const buildFunctionVersionArn = (region: string, accountId: string, functionName: string): Arn => {
  return `${buildFunctionArn(region, accountId, functionName)}:${FunctionDefaults.AliasName}`;
};
