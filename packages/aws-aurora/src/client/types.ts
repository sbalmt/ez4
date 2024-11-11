import type { Arn } from '@ez4/aws-common';

export type Configuration = {
  resourceArn: Arn;
  secretArn: Arn;
  database: string;
};
