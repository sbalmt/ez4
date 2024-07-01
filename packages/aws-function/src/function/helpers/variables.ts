import type { Variables } from '../../types/variables.js';

import { InvalidParameterError } from '@ez4/aws-common';

import { FunctionServiceName } from '../types.js';

const namePattern = /[a-z][\w]+/i;

export const isValidVariableName = (name: string) => {
  return namePattern.test(name);
};

export const assertVariables = (variables: Variables) => {
  for (const name in variables) {
    if (!isValidVariableName(name)) {
      throw new InvalidParameterError(
        FunctionServiceName,
        `name ${name} for variable unsupported.`
      );
    }
  }
};
