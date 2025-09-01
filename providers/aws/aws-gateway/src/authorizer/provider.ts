import { registerProvider } from '@ez4/aws-common';

import { AuthorizerServiceType } from './types';
import { getAuthorizerHandler } from './handler';

export const registerAuthorizerProvider = () => {
  registerProvider(AuthorizerServiceType, getAuthorizerHandler());
};
