import { tryCreateTrigger } from '@ez4/project/library';

import { generateResource } from './generator';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/docs-topology', {
    'generator:createResource': generateResource
  });
};
