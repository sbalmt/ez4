import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';
import { DynamicLogger } from '@ez4/logger';

export const lockDeploy = async (options: DeployOptions) => {
  const { lockId } = options;

  await DynamicLogger.logExecution('🔒 Acquiring lock', () => {
    return triggerAllAsync('deploy:lock', (handler) => handler({ lockId }));
  });
};
