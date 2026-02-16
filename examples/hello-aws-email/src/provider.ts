import type { Environment } from '@ez4/common';
import type { Http } from '@ez4/gateway';
import type { EmailService } from './email';

/**
 * Example of API provider.
 */
export interface ApiProvider extends Http.Provider {
  /**
   * All services in the context provider.
   */
  services: {
    emailService: Environment.Service<EmailService>;
  };
}
