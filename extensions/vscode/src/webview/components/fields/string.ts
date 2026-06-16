import type { StringSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { getElementById } from '../../utils/elements';

export namespace StringField {
  const getInput = (id: string) => {
    return getElementById<HTMLInputElement>('input', id);
  };

  export const getInputValue = (id: string, _schema: StringSchema) => {
    return getInput(id).value;
  };

  export const setInputValue = (id: string, schema: StringSchema, value?: string) => {
    getInput(id).value = value ?? schema.definitions?.default ?? '';
  };

  export const getInputElement = (id: string, schema: StringSchema) => {
    const { optional, definitions } = schema;

    const minLength = definitions?.minLength;
    const maxLength = definitions?.maxLength;
    const pattern = definitions?.pattern;

    const attributes = [];

    if (!optional) {
      attributes.push(`required`);
    }

    if (isAnyNumber(minLength)) {
      attributes.push(`minlength="${minLength}"`);
    }

    if (isAnyNumber(maxLength)) {
      attributes.push(`maxlength="${maxLength}"`);
    }

    if (pattern) {
      attributes.push(`pattern="${pattern}"`);
    }

    return [`<input type="text" placeholder="${schema.description ?? schema.type}" id="${id}" ${attributes.join(' ')}/>`];
  };
}
