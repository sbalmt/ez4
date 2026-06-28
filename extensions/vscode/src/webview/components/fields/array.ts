import type { AnySchema, ArraySchema } from '@ez4/schema';
import type { AnyObject } from '@ez4/utils';

import { isEmptyArray } from '@ez4/utils';

import { createElement, getElementById } from '../../utils/elements';
import { getFieldName } from '../../utils/forms';
import { AnyField } from './any';

export namespace ArrayField {
  const getInput = (name: string, form: HTMLFormElement) => {
    return form.elements.namedItem(name) as HTMLInputElement;
  };

  export const getInputValue = (name: string, schema: ArraySchema, form: HTMLFormElement) => {
    const list = getInput(name, form);
    const values: unknown[] = [];

    const { element } = schema;

    for (const elementId of unpackElementIds(list.value)) {
      const fieldName = getFieldName(name, elementId);
      const fieldValue = AnyField.getInputValue(fieldName, element, form);

      values.push(fieldValue);
    }

    if (schema.optional && isEmptyArray(values)) {
      return undefined;
    }

    return values;
  };

  export const setInputState = (name: string, schema: ArraySchema, form: HTMLFormElement, state?: AnyObject) => {
    const container = getElementById('div', name);
    const list = getInput(name, form);

    const { element } = schema;

    list.value = state?.[name];

    for (const elementId of unpackElementIds(list.value)) {
      const fieldName = appendNewElement(name, Number(elementId), element, list, container);

      self.requestAnimationFrame(() => AnyField.setInputState(fieldName, element, form, state));
    }
  };

  export const getInputElement = (name: string, schema: ArraySchema) => {
    const button = createElement('button', { className: 'link-button' }, ['add new item']);
    const container = createElement('div', { className: 'field-column', id: name });
    const list = createElement('input', { type: 'hidden', name });

    const { element } = schema;

    let counter = Date.now();

    button.onclick = () => {
      const elementId = counter++;

      appendNewElement(name, elementId, element, list, container);
      insertElementId(elementId, list);
    };

    return [button, container, list];
  };

  const appendNewElement = (name: string, elementId: number, schema: AnySchema, list: HTMLInputElement, container: HTMLDivElement) => {
    const fieldName = getFieldName(name, elementId);

    const button = createElement('button', { className: 'link-button' }, ['remove']);
    const inputs = createElement('div', { className: 'field-like field-group' }, [...AnyField.getInputElement(fieldName, schema), button]);

    button.onclick = () => {
      inputs.remove();
      removeElementId(elementId, list);
      list.dispatchEvent(new Event('change', { bubbles: true }));
    };

    container.append(inputs);

    return fieldName;
  };

  const insertElementId = (elementId: number, list: HTMLInputElement) => {
    const elementIds = [...unpackElementIds(list.value), elementId];

    list.value = elementIds.join(',');
  };

  const removeElementId = (elementId: number, list: HTMLInputElement) => {
    const elementIds = unpackElementIds(list.value).filter((currentId) => elementId.toString() !== currentId);

    list.value = elementIds.join(',');
  };

  const unpackElementIds = (value?: string) => {
    return value ? value.split(',') : [];
  };
}
