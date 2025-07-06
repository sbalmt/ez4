import type { Variables } from '../../types/variables.js';

import { InvalidParameterError } from '@ez4/aws-common';
import { hashData } from '@ez4/utils';

import { FunctionServiceName } from '../types.js';

const namePattern = /[a-z][\w]+/i;

const isValidName = (name: string) => {
  return namePattern.test(name);
};

export const assertVariables = (variables: Variables) => {
  for (const name in variables) {
    if (!isValidName(name)) {
      throw new InvalidParameterError(FunctionServiceName, `${name} is an invalid variable name .`);
    }
  }
};

export const protectVariables = (variables: Variables) => {
  const output: Variables = {};

  for (const name in variables) {
    output[name] = hashData(variables[name]);
  }

  return output;
};
