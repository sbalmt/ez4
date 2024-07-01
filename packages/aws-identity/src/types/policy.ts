export type PolicyStatement = {
  Sid: string;
  Effect: 'Allow' | 'Deny';
  Action: string[];
  Resource: string[];
};

export type PolicyDocument = {
  Version: string;
  Statement: PolicyStatement[];
};
