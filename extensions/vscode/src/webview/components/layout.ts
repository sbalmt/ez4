import { registerEditors } from './editor';
import { registerTabs } from './tabs';
import { getElementById } from '../utils/elements';

export const registerLayout = () => {
  return {
    tabs: registerTabs(),
    editors: registerEditors(),
    title: getElementById<HTMLHeadingElement>('h4', 'title'),
    description: getElementById<HTMLParagraphElement>('p', 'description'),
    actionType: getElementById<HTMLDivElement>('div', 'actionType'),
    actionPath: getElementById<HTMLDivElement>('div', 'actionPath'),
    runAction: getElementById<HTMLButtonElement>('button', 'runAction'),
    fields: {
      headersInputs: getElementById<HTMLDivElement>('div', 'headersInputs'),
      parametersInputs: getElementById<HTMLDivElement>('div', 'parametersInputs'),
      queryInputs: getElementById<HTMLDivElement>('div', 'queryInputs')
    },
    badges: {
      responseStatus: getElementById<HTMLButtonElement>('span', 'response-status'),
      responseTime: getElementById<HTMLButtonElement>('span', 'response-time')
    }
  };
};
