import type { EnumSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { createElement } from '../../utils/elements';

export namespace EnumField {
  const getInput = (name: string, form: HTMLFormElement) => {
    return form.elements.namedItem(name) as HTMLSelectElement;
  };

  export const getInputValue = (name: string, schema: EnumSchema, form: HTMLFormElement) => {
    const value = getInput(name, form).value;

    if (schema.optional && !value) {
      return undefined;
    }

    return value;
  };

  export const setInputState = (name: string, schema: EnumSchema, form: HTMLFormElement, state?: AnyObject) => {
    const value = state?.[name] ?? schema.definitions?.default ?? '';

    getInput(name, form).value = value;
  };

  export const getInputElement = (name: string, schema: EnumSchema) => {
    const options = [];

    if (schema.optional) {
      options.push(createElement('option', { value: '' }, ['-']));
    }

    options.push(
      ...schema.options.map(({ value }) => {
        return createElement('option', { value }, [value.toString()]);
      })
    );

    return [createElement('select', { name }, options)];
  };
}
