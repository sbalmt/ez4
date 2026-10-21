import type { ProviderContext } from '@ez4/emulator';
import type { LocalClientOptions } from '@ez4/local-storage/client';

import { createLocalClient } from '@ez4/local-storage/client';

export type ServiceOptions = LocalClientOptions;

export const makeService = (options: ServiceOptions, context: ProviderContext) => {
  return () => createLocalClient(options, context);
};
