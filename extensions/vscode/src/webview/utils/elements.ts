import type { AnyObject } from '@ez4/utils';

export const getElementById = <T extends keyof HTMLElementTagNameMap>(tag: T, id: string) => {
  const element = document.querySelector<HTMLElementTagNameMap[T]>(`body ${tag}#${id}`);

  if (!element) {
    throw new Error(`Element (${tag}) with Id '${id}' was not found.`);
  }

  return element;
};

export const getAllElementsByClass = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
  className: string,
  iterator?: (element: HTMLElementTagNameMap[T]) => void
): NodeListOf<HTMLElementTagNameMap[T]> => {
  const elements = document.querySelectorAll<HTMLElementTagNameMap[T]>(`body ${tag}.${className}`);

  if (iterator) {
    elements.forEach((element) => {
      iterator(element);
    });
  }

  return elements;
};

export const createElement = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
  attributes?: AnyObject,
  children?: (HTMLElement | string)[]
): HTMLElementTagNameMap[T] => {
  const element = document.createElement(tag);

  if (!element) {
    throw new TypeError(`Unable to create '${tag}' element.`);
  }

  for (const attributeName in attributes) {
    element[attributeName as keyof HTMLElementTagNameMap[T]] = attributes[attributeName];
  }

  children?.forEach((child) => {
    if (!(child instanceof HTMLElement)) {
      element.append(document.createTextNode(child));
    } else {
      element.append(child);
    }
  });

  return element;
};
