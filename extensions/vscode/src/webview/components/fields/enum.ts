import type { EnumSchema } from '@ez4/schema';

import { getElementById } from '../../utils/elements';

export namespace EnumField {
  const getInput = (id: string) => {
    return getElementById<HTMLSelectElement>('select', id);
  };

  export const getInputValue = (id: string, _schema: EnumSchema) => {
    return getInput(id).value;
  };

  export const setInputValue = (id: string, schema: EnumSchema, value?: string | number) => {
    getInput(id).value = (value ?? schema.definitions?.default)?.toString() ?? '';
  };

  export const getInputElement = (id: string, schema: EnumSchema) => {
    const options = schema.options.map((option, index) => {
      return `<option value="${option.value}"${index === 0 ? ' selected' : ''}>${option.value}</option>`;
    });

    return [`<select id="${id}">`, ...options, `</select>`];
  };
}
