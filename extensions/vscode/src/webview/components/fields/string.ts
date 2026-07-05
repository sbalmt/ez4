import type { StringSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isAnyNumber, isAnyString } from '@ez4/utils';

import { createElement } from '../../utils/elements';

export namespace StringField {
  const getInput = (name: string, form: HTMLFormElement) => {
    return form.elements.namedItem(name) as HTMLInputElement;
  };

  export const getInputValue = (name: string, schema: StringSchema, form: HTMLFormElement) => {
    const value = getInput(name, form).value;

    if (schema.optional && !value) {
      return undefined;
    }

    return value;
  };

  export const setInputState = (name: string, schema: StringSchema, form: HTMLFormElement, state?: AnyObject) => {
    const value = state?.[name] ?? schema.definitions?.default ?? '';

    if (!isAnyString(schema.definitions?.value)) {
      getInput(name, form).value = value;
    }
  };

  export const getInputElement = (name: string, schema: StringSchema) => {
    const { optional, definitions } = schema;

    const element = createElement('input', {
      placeholder: schema.description ?? schema.type,
      type: 'text',
      name
    });

    const pattern = definitions?.pattern;
    const minLength = definitions?.minLength;
    const maxLength = definitions?.maxLength;
    const value = definitions?.value;

    if (!optional) {
      element.required = true;
    }

    if (pattern) {
      element.pattern = pattern;
    }

    if (isAnyNumber(minLength)) {
      element.minLength = minLength;
    }

    if (isAnyNumber(maxLength)) {
      element.maxLength = maxLength;
    }

    if (isAnyString(value)) {
      element.readOnly = true;
      element.value = value;
    }

    return [element];
  };
}
