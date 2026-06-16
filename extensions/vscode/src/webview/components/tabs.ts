import { getAllElementsByClass, getElementById } from '../utils/elements';

export const registerTabs = () => {
  getAllElementsByClass<HTMLButtonElement>('button', 'action-tab', (current) => {
    const content = getElementById<HTMLDivElement>('div', `tab-${current.dataset.tab}`);

    current.onclick = () => {
      getAllElementsByClass<HTMLButtonElement>('button', 'action-tab', (button) => {
        button.classList.remove('active');
      });

      getAllElementsByClass<HTMLDivElement>('div', 'action-tab-content', (content) => {
        content.hidden = true;
      });

      current.classList.add('active');

      content.hidden = false;

      self.onresize?.(new UIEvent('resize'));
    };
  });

  return {
    actionHeaders: getElementById<HTMLButtonElement>('button', 'action-headers'),
    actionParameters: getElementById<HTMLButtonElement>('button', 'action-parameters'),
    actionQuery: getElementById<HTMLButtonElement>('button', 'action-query'),
    actionBody: getElementById<HTMLButtonElement>('button', 'action-body'),
    actionResponse: getElementById<HTMLButtonElement>('button', 'action-response')
  };
};

export const getFirstTab = (): HTMLButtonElement | undefined => {
  const elements = getAllElementsByClass<HTMLButtonElement>('button', 'action-tab:not([hidden])');

  return elements[0];
};
