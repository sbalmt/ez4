import type { NumberSchema } from '@ez4/schema';

import { isAnyNumber } from '@ez4/utils';

import { getElementById } from '../../utils/elements';

export namespace NumberField {
  const getInput = (id: string) => {
    return getElementById<HTMLInputElement>('input', id);
  };

  export const getInputValue = (id: string, _schema: NumberSchema) => {
    return getInput(id).valueAsNumber;
  };

  export const setInputValue = (id: string, schema: NumberSchema, value?: number) => {
    getInput(id).valueAsNumber = value ?? schema.definitions?.default ?? NaN;
  };

  export const getInputElement = (id: string, schema: NumberSchema) => {
    const { optional, definitions } = schema;

    const minValue = definitions?.minValue;
    const maxValue = definitions?.maxValue;

    const attributes = [];

    if (!optional) {
      attributes.push(`required`);
    }

    if (isAnyNumber(minValue)) {
      attributes.push(`min="${minValue}"`);
    }

    if (isAnyNumber(maxValue)) {
      attributes.push(`max="${maxValue}"`);
    }

    return [`<input type="number" placeholder="${schema.description ?? schema.type}" id="${id}" ${attributes.join(' ')}/>`];
  };
}
