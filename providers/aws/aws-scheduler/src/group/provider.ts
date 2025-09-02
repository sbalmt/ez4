import { registerProvider } from '@ez4/aws-common';

import { getGroupHandler } from './handler';
import { GroupServiceType } from './types';

export const registerGroupProvider = () => {
  registerProvider(GroupServiceType, getGroupHandler());
};
