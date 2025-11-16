import { tryCreateTrigger } from '@ez4/project/library';

import { getCommonEmulators, getCommonServices, prepareCommonServices, prepareLinkedServices } from './service';
import { applyRichTypeObject, applyRichTypePath } from './reflection';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/common', {
    'reflection:loadFile': applyRichTypePath,
    'reflection:typeObject': applyRichTypeObject,
    'deploy:prepareResources': prepareCommonServices,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'emulator:getServices': getCommonEmulators,
    'metadata:getServices': getCommonServices
  });
};
