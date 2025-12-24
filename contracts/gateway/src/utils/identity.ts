import type { ValidationCustomHandler } from '@ez4/validator';
import type { ObjectSchema, UnionSchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const resolveIdentity = async <T extends Http.Identity>(
  input: T,
  schema: ObjectSchema | UnionSchema,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const validationContext = createValidatorContext({
    property: '$identity',
    onCustomValidation
  });

  const validationErrors = await validate(input, schema, validationContext);

  if (validationErrors.length) {
    const messages = getUniqueErrorMessages(validationErrors);

    throw new HttpBadRequestError('Malformed authorizer identity.', messages);
  }

  return input as T;
};
