import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { createTransformContext, transform } from '@ez4/transform';
import { validate, createValidatorContext, getUniqueErrorMessages } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';
import { isNullish } from '@ez4/utils';

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
    property: '$query',
    pathStyle: inputStyle
  });

  const validationErrors = await validate(payload, schema, validationContext);

  if (validationErrors.length) {
    const messages = getUniqueErrorMessages(validationErrors);

    throw new HttpBadRequestError('Malformed query strings.', messages);
  }

  return payload as T;
};

export const prepareQueryStrings = <T extends Http.QueryStrings>(query: T) => {
  const queryStrings = [];

  for (const name in query) {
    const value = query[name];

    if (!isNullish(value)) {
      if (value instanceof Date) {
        queryStrings.push(`${name}=${encodeURIComponent(value.toISOString())}`);
        continue;
      }

      if (value instanceof Array) {
        queryStrings.push(`${name}=${encodeURIComponent(value.join(','))}`);
        continue;
      }

      queryStrings.push(`${name}=${encodeURIComponent(`${value}`)}`);
    }
  }

  if (queryStrings.length) {
    return queryStrings.join('&');
  }

  return undefined;
};
