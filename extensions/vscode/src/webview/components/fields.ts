import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { ObjectField } from './fields/object';

export const getFieldsPayload = (form: HTMLFormElement, id: string, schema?: ObjectSchema) => {
  if (schema) {
    return ObjectField.getInputValue(id, schema, form);
  }

  return undefined;
};

export const setFieldsSchema = (form: HTMLFormElement, id: string, schema?: ObjectSchema, state?: AnyObject) => {
  if (!schema) {
    return form.replaceChildren();
  }

  form.replaceChildren(...ObjectField.getInputElement(id, schema));

  ObjectField.setInputState(id, schema, form, state);
};
