import { registerProvider } from '@ez4/aws-common';

import { getLogGroupHandler } from './handler.js';
import { LogGroupServiceType } from './types.js';

export const registerLogGroupProvider = () => {
  registerProvider(LogGroupServiceType, getLogGroupHandler());
};
