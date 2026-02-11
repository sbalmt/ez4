import type { DeployOptions } from '../types/options';

import { triggerAllAsync } from '@ez4/project/library';
import { DynamicLogger, Logger } from '@ez4/logger';

export const performDeploy = async <T>(options: DeployOptions, callback: () => Promise<T> | T) => {
  const { lockId } = options;

  const handleInterruption = async () => {
    process.stdin.resume();

    await DynamicLogger.logExecution('\r🔓 Releasing lock (for graceful shutdown)', () => {
      return triggerAllAsync('deploy:unlock', (handler) => handler({ lockId }));
    });

    Logger.warn('Deploy interrupted (side effects may have occurred)');

    process.exit(0);
  };

  try {
    process.on('SIGINT', handleInterruption);

    await DynamicLogger.logExecution('🔒 Acquiring lock', () => {
      return triggerAllAsync('deploy:lock', (handler) => handler({ lockId }));
    });

    return await callback();
  } catch (error) {
    throw error;
  } finally {
    await DynamicLogger.logExecution('🔓 Releasing lock', () => {
      return triggerAllAsync('deploy:unlock', (handler) => handler({ lockId }));
    });

    process.off('SIGINT', handleInterruption);
  }
};
