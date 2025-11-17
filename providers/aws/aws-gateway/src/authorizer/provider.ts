import { tryRegisterProvider } from '@ez4/aws-common';

import { AuthorizerServiceType } from './types';
import { getAuthorizerHandler } from './handler';

export const registerAuthorizerProvider = () => {
  tryRegisterProvider(AuthorizerServiceType, getAuthorizerHandler());
};
