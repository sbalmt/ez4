import type { AnyObject } from '@ez4/utils';

import { getValidatorName } from '../metadata/utils/type';

export const resolveValidation = async (input: unknown, validators: AnyObject, name: string) => {
  const validator = validators[getValidatorName(name)];

  if (validator) {
    await validator.validate(input);
  }
};
