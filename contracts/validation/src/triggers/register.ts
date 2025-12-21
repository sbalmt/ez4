import { registerTriggers as registerValidatorTriggers } from '@ez4/validator/library';
import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { ServiceType } from '../metadata/types';
import { getValidationServicesMetadata } from '../metadata/service';
import { getLinkedService, prepareResources, prepareLinkedServices } from './service';
import { getEmulatorService } from './emulator';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerValidatorTriggers();

  tryCreateTrigger(ServiceType, {
    'metadata:getServices': getValidationServicesMetadata,
    'metadata:getLinkedService': getLinkedService,
    'deploy:prepareLinkedService': prepareLinkedServices,
    'deploy:prepareResources': prepareResources,
    'emulator:getServices': getEmulatorService
  });
};
