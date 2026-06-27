import type { BooleanSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isAnyBoolean } from '@ez4/utils';

import { createElement } from '../../utils/elements';

export namespace BooleanField {
  const getInput = (name: string, form: HTMLFormElement) => {
    return form.elements.namedItem(name) as HTMLSelectElement;
  };

  export const getInputValue = (name: string, schema: BooleanSchema, form: HTMLFormElement) => {
    const value = getInput(name, form).value;

    if (schema.optional && !value) {
      return undefined;
    }

    return value;
  };

  export const setInputState = (name: string, schema: BooleanSchema, form: HTMLFormElement, state?: AnyObject) => {
    const value = state?.[name] ?? schema.definitions?.default;

    getInput(name, form).value = value;
  };

  export const getInputElement = (name: string, schema: BooleanSchema) => {
    const options = [];

    const value = schema.definitions?.value;

    if (schema.optional) {
      options.push(createElement('option', { value: '' }, ['-']));
    }

    if (!isAnyBoolean(value) || value) {
      options.push(createElement('option', { value: 'true' }, ['true']));
    }

    if (!isAnyBoolean(value) || !value) {
      options.push(createElement('option', { value: 'false' }, ['false']));
    }

    return [createElement('select', { name }, options)];
  };
}
