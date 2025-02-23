import { registerProvider } from '@ez4/aws-common';

import { getCertificateHandler } from './handler.js';
import { CertificateServiceType } from './types.js';

export const registerCertificateProvider = () => {
  registerProvider(CertificateServiceType, getCertificateHandler());
};
