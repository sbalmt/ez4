import type { NumberSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isAnyNumber } from '@ez4/utils';

import { createElement } from '../../utils/elements';

export namespace NumberField {
  const getInput = (name: string, form: HTMLFormElement) => {
    return form.elements.namedItem(name) as HTMLInputElement;
  };

  export const getInputValue = (name: string, schema: NumberSchema, form: HTMLFormElement) => {
    const value = getInput(name, form).valueAsNumber;

    if (schema.optional && Number.isNaN(value)) {
      return undefined;
    }

    return value;
  };

  export const setInputState = (name: string, schema: NumberSchema, form: HTMLFormElement, state?: AnyObject) => {
    const value = state?.[name] ?? schema.definitions?.default ?? '';

    if (!isAnyNumber(schema.definitions?.value)) {
      getInput(name, form).value = value;
    }
  };

  export const getInputElement = (name: string, schema: NumberSchema) => {
    const { optional, definitions } = schema;

    const element = createElement('input', {
      placeholder: schema.description ?? schema.type,
      type: 'number',
      name
    });

    const minValue = definitions?.minValue;
    const maxValue = definitions?.maxValue;
    const value = definitions?.value;

    if (!optional) {
      element.required = true;
    }

    if (isAnyNumber(minValue)) {
      element.min = minValue.toString();
    }

    if (isAnyNumber(maxValue)) {
      element.max = maxValue.toString();
    }

    if (isAnyNumber(value)) {
      element.valueAsNumber = value;
      element.readOnly = true;
    }

    return [element];
  };
}
