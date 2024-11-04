import type { ObjectSchema } from '@ez4/schema';
import type { Arn } from '@ez4/aws-common';

export type Configuration = {
  resourceArn: Arn;
  secretArn: Arn;
  database: string;
};

export type Repository = {
  tableName: string;
  tableSchema: ObjectSchema;
};
