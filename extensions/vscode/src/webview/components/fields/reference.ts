import type { ReferenceSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { createElement } from '../../utils/elements';

export namespace ReferenceField {
  export const getInputValue = (_name: string, _schema: ReferenceSchema, _form: HTMLFormElement) => {
    return undefined;
  };

  export const setInputState = (_name: string, _schema: ReferenceSchema, _form: HTMLFormElement, _state?: AnyObject) => {};

  export const getInputElement = (_name: string, _schema: ReferenceSchema) => {
    return [
      createElement('div', { className: 'field-like field-row' }, [
        createElement('label', {}, ['$ref']),
        createElement('div', { className: 'field-row' }, ['Unsupported'])
      ])
    ];
  };
}
