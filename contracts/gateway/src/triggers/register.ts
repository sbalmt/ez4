import { registerTriggers as registerCommonTriggers } from '@ez4/common/library';
import { registerTriggers as registerSchemaTriggers } from '@ez4/schema/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { WsServiceType } from '../metadata/ws/types';
import { getHttpImportsMetadata } from '../metadata/http/import';
import { HttpImportType, HttpServiceType } from '../metadata/http/types';
import { getHttpServicesMetadata } from '../metadata/http/service';
import { getWsServicesMetadata } from '../metadata/ws/service';
import { getLinkedImport, getLinkedService } from './service';

export const registerTriggers = () => {
  registerCommonTriggers();
  registerSchemaTriggers();

  tryCreateTrigger(WsServiceType, {
    'metadata:getServices': getWsServicesMetadata,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(HttpServiceType, {
    'metadata:getServices': getHttpServicesMetadata,
    'metadata:getLinkedService': getLinkedService
  });

  tryCreateTrigger(HttpImportType, {
    'metadata:getServices': getHttpImportsMetadata,
    'metadata:getLinkedService': getLinkedImport
  });
};
