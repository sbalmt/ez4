import type { ProviderContext, ServiceReferences } from '@ez4/emulator';

import { getLazyContext } from '@ez4/emulator';

let generation = 0;

export const makeServiceClient = async (options: { value?: string; fail?: boolean }) => {
  await Promise.resolve();

  if (options.fail) {
    throw new Error('Service initialization failed.');
  }

  const currentGeneration = ++generation;
  let calls = 0;

  return () => ({
    value: options.value,
    generation: currentGeneration,
    increment: () => ++calls
  });
};

export const makeDependentService = (options: { references: ServiceReferences }, context: ProviderContext) => {
  return () => ({
    dependency: getLazyContext(context.services, options.references).dependency
  });
};

export const makeEnvironmentService = (_options: unknown, context: ProviderContext) => {
  const { variables } = context;

  if (!variables) {
    throw new Error('Missing client environment.');
  }

  return () => ({
    readVariable: (name: string) => variables[name]
  });
};
