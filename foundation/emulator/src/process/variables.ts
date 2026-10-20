import type { ServiceDescriptors } from '../types/service';

import { DuplicateVariablesError } from '../errors/variables';

export const getServiceVariables = (serviceName: string, descriptors: ServiceDescriptors) => {
  const variables: Record<string, string> = {};

  for (const identifier in descriptors) {
    const currentVariables = descriptors[identifier].variables;

    for (const name in currentVariables) {
      const value = currentVariables[name];

      if (name in variables && variables[name] !== value) {
        throw new DuplicateVariablesError(name, serviceName);
      }

      variables[name] = value;
    }
  }

  return variables;
};
