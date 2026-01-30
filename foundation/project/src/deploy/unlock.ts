import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';
import { DynamicLogger } from '@ez4/logger';

export const unlockDeploy = async (options: DeployOptions) => {
  const { lockId } = options;

  await DynamicLogger.logExecution('🔓 Releasing lock', () => {
    return triggerAllAsync('deploy:unlock', (handler) => handler({ lockId }));
  });
};
