import { tryRegisterProvider } from '@ez4/aws-common';

import { getResponseHandler } from './handler';
import { ResponseServiceType } from './types';

export const registerResponseProvider = () => {
  tryRegisterProvider(ResponseServiceType, getResponseHandler());
};
