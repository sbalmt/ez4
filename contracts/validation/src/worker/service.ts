import type { ProviderContext, ServiceReferences } from '@ez4/emulator';
import type { AnySchema } from '@ez4/schema';
import type { ValidationHandler } from '../metadata/types';

import { EntrypointNotFoundError, getLazyContext, loadFunction } from '@ez4/emulator';

export type ServiceOptions = {
  handler: ValidationHandler;
  references: ServiceReferences;
  schema: AnySchema;
};

export const makeService = async (options: ServiceOptions, context: ProviderContext) => {
  const { handler, references, schema } = options;
  const { services } = context;

  const { callback } = await loadFunction(handler);

  if (!callback) {
    throw new EntrypointNotFoundError(handler.name, handler.file);
  }

  return () => {
    const context = getLazyContext(services, references);

    const validate = async (value: unknown) => {
      await callback({ value, schema: schema }, context);
    };

    const tryValidate = async (value: unknown) => {
      try {
        return (await validate(value), true);
      } catch {
        return false;
      }
    };

    return {
      schema,
      validate,
      tryValidate
    };
  };
};
