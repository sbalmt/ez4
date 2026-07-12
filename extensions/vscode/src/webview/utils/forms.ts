import type { AnyObject } from '@ez4/utils';

export const getFieldName = (parentId: string, id: string | number) => {
  return `${parentId}_${id}`;
};

export const getFormState = (form: HTMLFormElement) => {
  const state: AnyObject = {};

  for (const element of form.elements) {
    if (element instanceof HTMLSelectElement) {
      state[element.name] = element.value;
      continue;
    }

    if (element instanceof HTMLTextAreaElement) {
      state[element.name] = element.value;
      continue;
    }

    if (element instanceof HTMLInputElement) {
      if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
        continue;
      }

      state[element.name] = element.value;
    }
  }

  return state;
};
