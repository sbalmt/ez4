import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';

export const getQueryStrings = async <T extends Http.QueryStrings>(
  input: T,
  schema: ObjectSchema,
  preferences?: Http.Preferences | null
): Promise<T> => {
  const inputStyle = preferences?.namingStyle;

  const transformContext = createTransformContext({
    convert: true,
    inputStyle
  });

  const payload = transform(input, schema, transformContext);

  const validationContext = createValidatorContext({
    property: '$query'
  });

  const validationErrors = await validate(payload, schema, validationContext);

  if (validationErrors.length) {
    const messages = getUniqueErrorMessages(validationErrors);

    throw new HttpBadRequestError('Malformed query strings.', messages);
  }

  return payload as T;
};
