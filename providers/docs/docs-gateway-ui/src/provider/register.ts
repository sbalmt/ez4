import { tryCreateTrigger } from '@ez4/project/library';
import { handleFallbackRequest } from './local';

export const registerTriggers = () => {
  tryCreateTrigger('@ez4/docs-gateway-ui', {
    'emulator:fallbackRequest': handleFallbackRequest
  });
};
