export type PrincipalService = {
  Service: string | string[];
};

export type PrincipalAccount = {
  AWS: string | string[];
};

export type RoleStatementCondition = {
  StringEquals?: Record<string, string>;
};

export type RoleStatement = {
  Sid: string;
  Effect: 'Allow' | 'Deny';
  Action: string | string[];
  Resource?: string | string[];
  Principal: PrincipalService | PrincipalAccount;
  Condition?: RoleStatementCondition;
};

export type RoleDocument = {
  Version: string;
  Statement: RoleStatement[];
};
