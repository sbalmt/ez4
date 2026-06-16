import type { BooleanSchema } from '@ez4/schema';

import { getElementById } from '../../utils/elements';

export namespace BooleanField {
  const getInput = (id: string) => {
    return getElementById<HTMLInputElement>('input', id);
  };

  export const getInputValue = (id: string, _schema: BooleanSchema) => {
    return getInput(id).checked;
  };

  export const setInputValue = (id: string, schema: BooleanSchema, value?: boolean) => {
    getInput(id).checked = value ?? schema?.definitions?.default ?? false;
  };

  export const getInputElement = (id: string, _schema: BooleanSchema) => {
    return [`<input type="checkbox" id="${id}" />`];
  };
}
