import { getElementById } from '../utils/elements';
import { registerEditors } from './editor';
import { registerForms } from './forms';
import { registerTabs } from './tabs';

export const registerLayout = () => {
  return {
    tabs: registerTabs(),
    forms: registerForms(),
    editors: registerEditors(),
    title: getElementById<HTMLHeadingElement>('h4', 'title'),
    description: getElementById<HTMLParagraphElement>('p', 'description'),
    actionType: getElementById<HTMLDivElement>('div', 'actionType'),
    actionPath: getElementById<HTMLDivElement>('div', 'actionPath'),
    runAction: getElementById<HTMLButtonElement>('button', 'runAction'),
    badges: {
      responseStatus: getElementById<HTMLButtonElement>('span', 'response-status'),
      responseTime: getElementById<HTMLButtonElement>('span', 'response-time')
    }
  };
};
