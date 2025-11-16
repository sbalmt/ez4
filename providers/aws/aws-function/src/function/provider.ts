import { tryRegisterProvider } from '@ez4/aws-common';

import { getFunctionHandler } from './handler';
import { FunctionServiceType } from './types';

export const registerFunctionProvider = () => {
  tryRegisterProvider(FunctionServiceType, getFunctionHandler());
};
