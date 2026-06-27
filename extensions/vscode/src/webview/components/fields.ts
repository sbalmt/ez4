import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isObjectSchema } from '@ez4/schema';

import { ObjectField } from './fields/object';

export const getFieldsPayload = (form: HTMLFormElement, id: string, schema?: ObjectSchema) => {
  if (schema) {
    return ObjectField.getInputValue(id, schema, form);
  }

  return undefined;
};

export const setFieldsSchema = (form: HTMLFormElement, id: string, schema?: ObjectSchema, state?: AnyObject) => {
  if (!schema || !isObjectSchema(schema)) {
    return false;
  }

  const elements = ObjectField.getInputElement(id, schema);

  form.replaceChildren(...elements);

  if (state) {
    ObjectField.setInputState(id, schema, form, state);
  }

  return !!elements.length;
};
