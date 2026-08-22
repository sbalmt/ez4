import type { EntryState, EntryStates } from '@ez4/state';
import type { CertificateParameters, CertificateState } from './types';

import { attachEntry } from '@ez4/state';

import { CertificateServiceType } from './types';
import { createCertificateStateId } from './utils';

export const createCertificate = <E extends EntryState>(state: EntryStates<E>, parameters: CertificateParameters) => {
  const certificateId = createCertificateStateId(parameters.domainName);

  return attachEntry<E | CertificateState, CertificateState>(state, {
    type: CertificateServiceType,
    entryId: certificateId,
    dependencies: [],
    parameters
  });
};
