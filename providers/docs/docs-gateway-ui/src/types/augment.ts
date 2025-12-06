import '@ez4/gateway';
import type { DocsConfig } from './config';

declare module '@ez4/gateway' {
  namespace Http {
    interface Service {
      docs?: DocsConfig;
    }
  }
}
