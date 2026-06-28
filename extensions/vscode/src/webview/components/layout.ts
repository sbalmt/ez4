import { getElementById } from '../utils/elements';
import { registerEditors } from './editor';
import { registerForms } from './forms';
import { registerTabs } from './tabs';

export const registerLayout = () => {
  return {
    tabs: registerTabs(),
    forms: registerForms(),
    editors: registerEditors(),
    title: getElementById('h4', 'title'),
    description: getElementById('p', 'description'),
    sourceLinks: getElementById('ul', 'sources'),
    actionType: getElementById('div', 'actionType'),
    actionPath: getElementById('div', 'actionPath'),
    runAction: getElementById('button', 'runAction'),
    badges: {
      responseStatus: getElementById('span', 'response-status'),
      responseTime: getElementById('span', 'response-time')
    }
  };
};
