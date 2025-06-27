import { DatabaseResumingException } from '@aws-sdk/client-rds-data';
import { setTimeout } from 'node:timers/promises';

export const callWithRetryOnResume = async <T>(callback: () => Promise<T>) => {
  for (let milliseconds = 4500; ; milliseconds -= 500) {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof DatabaseResumingException && milliseconds > 0) {
        await setTimeout(milliseconds);
        continue;
      }

      throw error;
    }
  }
};
