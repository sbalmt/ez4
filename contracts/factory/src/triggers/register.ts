import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { ServiceType } from '../metadata/types';
import { getFactoryServicesMetadata } from '../metadata/service';
import { getEmulatorService, getLinkedService, prepareResources, prepareLinkedServices } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getFactoryServicesMetadata,
    'metadata:getLinkedService': getLinkedService,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareResources,
    'emulator:getServices': getEmulatorService
  });
};
