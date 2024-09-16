import { registerProvider } from '@ez4/aws-common';

import { getTableHandler } from './handler.js';
import { TableServiceType } from './types.js';

export const registerTableProvider = () => {
  registerProvider(TableServiceType, getTableHandler());
};
