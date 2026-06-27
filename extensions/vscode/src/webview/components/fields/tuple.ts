import type { TupleSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isEmptyArray } from '@ez4/utils';

import { createElement } from '../../utils/elements';
import { getFieldName } from '../../utils/forms';
import { AnyField } from './any';

export namespace TupleField {
  export const getInputValue = (name: string, schema: TupleSchema, form: HTMLFormElement) => {
    const value: unknown[] = [];

    let elementId = 0;

    for (const elementSchema of schema.elements) {
      const fieldName = getFieldName(name, elementId);

      value.push(AnyField.getInputValue(fieldName, elementSchema, form));

      elementId++;
    }

    if (schema.optional && isEmptyArray(value)) {
      return undefined;
    }

    return value;
  };

  export const setInputState = (name: string, schema: TupleSchema, form: HTMLFormElement, state?: AnyObject) => {
    let elementId = 0;

    for (const elementSchema of schema.elements) {
      const fieldName = getFieldName(name, elementId);

      AnyField.setInputState(fieldName, elementSchema, form, state);

      elementId++;
    }
  };

  export const getInputElement = (name: string, schema: TupleSchema) => {
    const elements = [];

    let elementId = 0;

    for (const elementSchema of schema.elements) {
      const fieldName = getFieldName(name, elementId);

      elements.push(
        createElement('div', { className: 'field-like field-row' }, [
          createElement('label', {}, [`#${elementId}`]),
          ...AnyField.getInputElement(fieldName, elementSchema)
        ])
      );

      elementId++;
    }

    return elements;
  };
}
