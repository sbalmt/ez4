import { tryRegisterProvider } from '@ez4/aws-common';

import { getTableHandler } from './handler';
import { TableServiceType } from './types';

export const registerTableProvider = () => {
  tryRegisterProvider(TableServiceType, getTableHandler());
};
