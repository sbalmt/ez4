import type { Arn } from '@ez4/aws-common';

export type Connection = {
  resourceArn: Arn;
  secretArn: Arn;
  database: string;
};
