import { registerProvider } from '@ez4/aws-common';

import { getGroupHandler } from './handler.js';
import { GroupServiceType } from './types.js';

export const registerGroupProvider = () => {
  registerProvider(GroupServiceType, getGroupHandler());
};
