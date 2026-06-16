import type { AnyObject } from '@ez4/utils';

import { isAnySchema, isObjectSchema } from '@ez4/schema';

import { ObjectField } from './fields/object';

export const getFieldsPayload = (id: string, schema?: AnyObject) => {
  if (schema && isAnySchema(schema) && isObjectSchema(schema)) {
    return ObjectField.getInputValue(id, schema);
  }

  return undefined;
};

export const setFieldsSchema = (container: HTMLDivElement, id: string, schema?: AnyObject, values?: AnyObject) => {
  if (!schema || !isAnySchema(schema) || !isObjectSchema(schema)) {
    return false;
  }

  const elements = ObjectField.getInputElement(id, schema);

  container.innerHTML = elements.join('');

  if (values) {
    ObjectField.setInputValue(id, schema, values);
  }

  return !!elements.length;
};
