import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client';

export const CertificateServiceName = 'AWS:ACM/Certificate';

export const CertificateServiceType = 'aws:acm.certificate';

export type CertificateParameters = CreateRequest & {
  allowDeletion?: boolean;
};

export type CertificateResult = CreateResponse;

export type CertificateState = EntryState & {
  type: typeof CertificateServiceType;
  parameters: CertificateParameters;
  result?: CertificateResult;
};
