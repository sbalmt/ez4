import { createPolicyDocument } from '@ez4/aws-identity';

export const getPolicyDocument = () => {
  return createPolicyDocument([
    {
      resourceIds: ['*'],
      permissions: ['ses:SendEmail']
    }
  ]);
};
