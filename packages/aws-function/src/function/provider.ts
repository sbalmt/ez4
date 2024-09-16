import { registerProvider } from '@ez4/aws-common';

import { getFunctionHandler } from './handler.js';
import { FunctionServiceType } from './types.js';

export const registerFunctionProvider = () => {
  registerProvider(FunctionServiceType, getFunctionHandler());
};
