export type PrincipalService = {
  Service: string[];
};

export type PrincipalAccount = {
  AWS: string[];
};

export type RoleStatement = {
  Sid: string;
  Effect: 'Allow' | 'Deny';
  Action: string;
  Principal: PrincipalService | PrincipalAccount;
};

export type RoleDocument = {
  Version: string;
  Statement: RoleStatement[];
};
