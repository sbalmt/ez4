import type { ProviderContext } from '@ez4/emulator';
import type { LocalClientOptions } from '../client/local';

import { createLocalClient } from '../client/local';

export type ServiceOptions = LocalClientOptions;

export const makeService = (options: ServiceOptions, context: ProviderContext) => {
  return () => createLocalClient(options, context);
};
