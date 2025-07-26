import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CertificateParameters } from './types.js';

import { createCertificate as baseCreateCertificate } from '@ez4/aws-certificate';

export const createCertificate = <E extends EntryState>(state: EntryStates<E>, parameters: CertificateParameters) => {
  return baseCreateCertificate(state, {
    ...parameters
  });
};
