import { tryRegisterProvider } from '@ez4/aws-common';

import { getStageHandler } from './handler';
import { StageServiceType } from './types';

export const registerStageProvider = () => {
  tryRegisterProvider(StageServiceType, getStageHandler());
};
