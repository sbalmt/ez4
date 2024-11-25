import type { ObjectSchema } from '@ez4/schema';
import type { Http } from '@ez4/gateway';

import { HttpBadRequestError } from '@ez4/gateway';
import { validate, getUniqueErrorMessages } from '@ez4/validator';
import { getPartialSchemaProperties } from '@ez4/schema';
import { deepClone } from '@ez4/utils';

export const getRequestJsonBody = async (
  body: Http.JsonBody,
  schema: ObjectSchema
): Promise<Http.JsonBody> => {
  const errors = await validate(body, schema, '$body');

  if (errors.length) {
    const messages = getUniqueErrorMessages(errors);

    throw new HttpBadRequestError(`Malformed body payload.`, messages);
  }

  return body;
};

export const getResponseJsonBody = (body: Http.JsonBody, schema: ObjectSchema): Http.JsonBody => {
  return deepClone(body, {
    include: getPartialSchemaProperties(schema)
  });
};
