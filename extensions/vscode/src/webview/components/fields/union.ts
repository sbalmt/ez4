import type { UnionSchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isAnyNumber } from '@ez4/utils';

import { createElement } from '../../utils/elements';
import { getFieldName } from '../../utils/forms';
import { AnyField } from './any';

export namespace UnionField {
  const getInput = (name: string, form: HTMLFormElement) => {
    return form.elements.namedItem(name) as RadioNodeList;
  };

  export const getInputValue = (name: string, schema: UnionSchema, form: HTMLFormElement): unknown | undefined => {
    const elementId = Number(getInput(name, form).value);

    if (!isAnyNumber(elementId)) {
      return undefined;
    }

    const elementSchema = schema.elements[elementId];

    if (!elementSchema) {
      return undefined;
    }

    const fieldName = getFieldName(name, elementId);

    return AnyField.getInputValue(fieldName, elementSchema, form);
  };

  export const setInputState = (name: string, schema: UnionSchema, form: HTMLFormElement, state?: AnyObject) => {
    const value = state?.[name];

    let elementId = 0;

    for (const input of getInput(name, form)) {
      input.checked = input.value === value;
    }

    for (const elementSchema of schema.elements) {
      const fieldName = getFieldName(name, elementId);

      AnyField.setInputState(fieldName, elementSchema, form, state);

      elementId++;
    }
  };

  export const getInputElement = (name: string, schema: UnionSchema) => {
    const elements = [];

    let elementId = 0;

    if (schema.optional) {
      elements.push(
        createElement('div', { className: 'field-like field-row' }, [
          createElement('label', {}, [createElement('input', { type: 'radio', checked: true, value: elementId, name })]),
          createElement('div', { className: 'field-text field-row' }, ['-'])
        ])
      );
    }

    for (const elementSchema of schema.elements) {
      const fieldName = getFieldName(name, elementId++);

      elements.push(
        createElement('div', { className: 'field-like field-row' }, [
          createElement('label', {}, [createElement('input', { type: 'radio', value: elementId, name })]),
          ...AnyField.getInputElement(fieldName, elementSchema)
        ])
      );
    }

    return elements;
  };
}
