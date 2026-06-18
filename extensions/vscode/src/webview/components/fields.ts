import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isObjectSchema } from '@ez4/schema';

import { ObjectField } from './fields/object';

export const getFieldsPayload = (id: string, schema?: ObjectSchema) => {
  if (schema) {
    return ObjectField.getInputValue(id, schema);
  }

  return undefined;
};

export const setFieldsSchema = (container: HTMLFormElement, id: string, schema?: ObjectSchema, values?: AnyObject) => {
  if (!schema || !isObjectSchema(schema)) {
    return false;
  }

  const elements = ObjectField.getInputElement(id, schema);

  container.innerHTML = elements.join('');

  if (values) {
    ObjectField.setInputValue(id, schema, values);
  }

  return !!elements.length;
};
