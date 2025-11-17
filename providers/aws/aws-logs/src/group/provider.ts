import { tryRegisterProvider } from '@ez4/aws-common';

import { getLogGroupHandler } from './handler';
import { LogGroupServiceType } from './types';

export const registerLogGroupProvider = () => {
  tryRegisterProvider(LogGroupServiceType, getLogGroupHandler());
};
