import { registerProvider } from '@ez4/aws-common';

import { AuthorizerServiceType } from './types.js';
import { getAuthorizerHandler } from './handler.js';

export const registerAuthorizerProvider = () => {
  registerProvider(AuthorizerServiceType, getAuthorizerHandler());
};
