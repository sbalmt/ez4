import type { Variables } from '../../types/variables';

import { InvalidParameterError } from '@ez4/aws-common';

const valuePattern = /[\w\-\.\~\:\/\?\#\&\;\=\,]+/;
const namePattern = /[A-Za-z_]+/;

export const isValidVariableName = (name: string) => {
  return namePattern.test(name);
};

export const isValidVariableValue = (value: string) => {
  return valuePattern.test(value);
};

export const assertVariables = (serviceName: string, variables: Variables) => {
  for (const name in variables) {
    if (!isValidVariableName(name)) {
      throw new InvalidParameterError(serviceName, `name ${name} for variable is not supported.`);
    }

    if (!isValidVariableValue(name)) {
      throw new InvalidParameterError(serviceName, `value for variable ${name} is not supported.`);
    }
  }
};
