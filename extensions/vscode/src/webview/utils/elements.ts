export const getElementById = <T extends HTMLElement>(tag: string, id: string) => {
  const element = document.querySelector<T>(`body>main ${tag}#${id}`);

  if (!element) {
    throw new Error(`Element (${tag}) with Id '${id}' was not found.`);
  }

  return element;
};

export const getAllElementsByClass = <T extends HTMLElement>(
  tag: string,
  className: string,
  iterator?: (element: T) => void
): NodeListOf<T> => {
  const elements = document.querySelectorAll<T>(`body>main ${tag}.${className}`);

  if (iterator) {
    elements.forEach((element) => {
      iterator(element);
    });
  }

  return elements;
};
