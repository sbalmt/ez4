import type { Warning } from '@ez4/state';

import { Logger } from '@ez4/logger';

export const exposeAllWarnings = (warnings: Warning[]) => {
  if (warnings.length) {
    Logger.space();

    warnings.forEach(({ message }) => Logger.warn(message));
  }
};
