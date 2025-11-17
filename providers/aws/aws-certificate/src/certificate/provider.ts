import { tryRegisterProvider } from '@ez4/aws-common';

import { getCertificateHandler } from './handler';
import { CertificateServiceType } from './types';

export const registerCertificateProvider = () => {
  tryRegisterProvider(CertificateServiceType, getCertificateHandler());
};
