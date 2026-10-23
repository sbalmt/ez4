import { isHttpService } from '@ez4/gateway/library';
import { tryCreateTrigger } from '@ez4/project/library';

import { registerDocsProvider } from './local';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/docs-gateway-ui', {
    'emulator:getServices': ({ service, options }) => {
      return isHttpService(service) ? registerDocsProvider(service, options) : null;
    }
  });
};
