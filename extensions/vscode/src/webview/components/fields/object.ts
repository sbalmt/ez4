import type { ObjectSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isEmptyObject } from '@ez4/utils';

import { createElement } from '../../utils/elements';
import { getFieldName } from '../../utils/forms';
import { AnyField } from './any';

export namespace ObjectField {
  export const getInputValue = (name: string, schema: ObjectSchema, form: HTMLFormElement) => {
    const value: AnyObject = {};

    for (const propertyKey in schema.properties) {
      const propertySchema = schema.properties[propertyKey];
      const fieldName = getFieldName(name, propertyKey);

      value[propertyKey] = AnyField.getInputValue(fieldName, propertySchema, form);
    }

    if (schema.optional && isEmptyObject(value)) {
      return undefined;
    }

    return value;
  };

  export const setInputState = (name: string, schema: ObjectSchema, form: HTMLFormElement, state?: AnyObject) => {
    for (const propertyKey in schema.properties) {
      const propertySchema = schema.properties[propertyKey];
      const fieldName = getFieldName(name, propertyKey);

      AnyField.setInputState(fieldName, propertySchema, form, state);
    }
  };

  export const getInputElement = (name: string, schema: ObjectSchema) => {
    const elements = [];

    for (const propertyKey in schema.properties) {
      const propertySchema = schema.properties[propertyKey];
      const fieldName = getFieldName(name, propertyKey);

      elements.push(
        createElement('div', { className: 'field-like field-row' }, [
          createElement('label', {}, [propertyKey]),
          ...AnyField.getInputElement(fieldName, propertySchema)
        ])
      );
    }

    return elements;
  };
}
