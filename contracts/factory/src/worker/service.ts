import type { ServiceReferences } from '@ez4/emulator';
import type { ProviderContext } from '@ez4/emulator';
import type { FactoryHandler } from '../metadata/types';

import { EntrypointNotFoundError, getLazyContext, loadFunction } from '@ez4/emulator';

export type ServiceOptions = {
  handler: FactoryHandler;
  references: ServiceReferences;
};

export const makeService = async (options: ServiceOptions, context: ProviderContext) => {
  const { handler, references } = options;
  const { services } = context;

  const { callback } = await loadFunction(handler);

  if (!callback) {
    throw new EntrypointNotFoundError(handler.name, handler.file);
  }

  return () => {
    const context = getLazyContext(services, references);

    return callback(context);
  };
};
