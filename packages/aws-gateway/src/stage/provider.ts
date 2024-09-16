import { registerProvider } from '@ez4/aws-common';

import { getStageHandler } from './handler.js';
import { StageServiceType } from './types.js';

export const registerStageProvider = () => {
  registerProvider(StageServiceType, getStageHandler());
};
