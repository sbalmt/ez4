import { getAllElementsByClass, getElementById } from '../utils/elements';

export const registerTabs = () => {
  getAllElementsByClass('button', 'action-tab', (current) => {
    const content = getElementById('div', `tab-${current.dataset.tab}`);

    current.onclick = () => {
      getAllElementsByClass('button', 'action-tab', (button) => {
        button.classList.remove('active');
      });

      getAllElementsByClass('div', 'action-tab-content', (content) => {
        content.hidden = true;
      });

      current.classList.add('active');

      content.hidden = false;

      self.onresize?.(new UIEvent('resize'));
    };
  });

  return {
    actionParameters: getElementById('button', 'action-parameters'),
    actionRequest: getElementById('button', 'action-request'),
    actionResponse: getElementById('button', 'action-response')
  };
};

export const getFirstTab = (): HTMLButtonElement | undefined => {
  const elements = getAllElementsByClass('button', 'action-tab:not([hidden])');

  return elements[0];
};
