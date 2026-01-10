import type { ValidationCustomHandler } from '@ez4/validator';
import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '../services/http/contract';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, getUniqueErrorMessages, createValidatorContext } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const preparePathParameters = (path: string, parameters: Record<string, string>) => {
  return path.replaceAll(/\{(\w+)\}/g, (_, parameterName) => {
    if (parameterName in parameters) {
      return `${parameters[parameterName]}`;
    }

    return `{${parameterName}}`;
  });
};

export const resolvePathParameters = async <T extends Http.PathParameters>(
  input: T,
  schema: ObjectSchema,
  onCustomValidation?: ValidationCustomHandler
): Promise<T> => {
  const parameters = transform(input, schema, createTransformContext({ convert: false }));

  const validationContext = createValidatorContext({
    property: '$path',
    onCustomValidation
  });

  const validationErrors = await validate(parameters, schema, validationContext);

  if (validationErrors.length) {
    const details = getUniqueErrorMessages(validationErrors);

    throw new HttpBadRequestError('Malformed path parameters.', { details });
  }

  return parameters as T;
};
