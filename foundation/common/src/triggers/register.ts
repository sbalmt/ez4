import { createTrigger } from '@ez4/project/library';

import { getCommonEmulators, getCommonServices, prepareCommonServices, prepareLinkedServices } from './service';
import { applyRichTypeObject, applyRichTypePath } from './reflection';

let isRegistered = false;

export const registerTriggers = () => {
  if (isRegistered) {
    return;
  }

  createTrigger('@ez4/common', {
    'reflection:loadFile': applyRichTypePath,
    'reflection:typeObject': applyRichTypeObject,
    'deploy:prepareResources': prepareCommonServices,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'emulator:getServices': getCommonEmulators,
    'metadata:getServices': getCommonServices
  });

  isRegistered = true;
};
