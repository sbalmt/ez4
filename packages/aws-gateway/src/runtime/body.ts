import type { AnySchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { validate, getUniqueErrorMessages, getNewContext } from '@ez4/validator';
import { HttpBadRequestError } from '@ez4/gateway';
import { transform } from '@ez4/transform';

export const getRequestJsonBody = async (body: Http.JsonBody, schema: AnySchema): Promise<Http.JsonBody> => {
  const errors = await validate(body, schema, getNewContext('$body'));

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed body payload.`, messages);
  }

  return body;
};

export const getResponseJsonBody = (body: unknown, schema: AnySchema) => {
  return transform(body, schema);
};
