import type { IdentityAccount } from '@ez4/project/library';

export const prepareIdentityAccount = (): IdentityAccount[] => {
  return [
    {
      account: 'lambda.amazonaws.com'
    }
  ];
};
