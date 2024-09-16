export type PolicyStatement = {
  Sid: string;
  Effect: 'Allow' | 'Deny';
  Action: string | string[];
  Resource: string | string[];
};

export type PolicyDocument = {
  Version: string;
  Statement: PolicyStatement[];
};
