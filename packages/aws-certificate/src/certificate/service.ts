import type { EntryState, EntryStates } from '@ez4/stateful';
import type { CertificateParameters, CertificateState } from './types.js';

import { attachEntry } from '@ez4/stateful';

import { CertificateServiceType } from './types.js';
import { createCertificateStateId } from './utils.js';

export const createCertificate = <E extends EntryState>(
  state: EntryStates<E>,
  parameters: CertificateParameters
) => {
  const certificateId = createCertificateStateId(parameters.domainName);

  return attachEntry<E | CertificateState, CertificateState>(state, {
    type: CertificateServiceType,
    entryId: certificateId,
    dependencies: [],
    parameters
  });
};
