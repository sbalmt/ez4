import type { EntryState } from '@ez4/stateful';
import type { CreateRequest, CreateResponse } from './client.js';

export const CertificateServiceName = 'AWS:ACM/Certificate';

export const CertificateServiceType = 'aws:acm.certificate';

export type CertificateParameters = CreateRequest;

export type CertificateResult = CreateResponse;

export type CertificateState = EntryState & {
  type: typeof CertificateServiceType;
  parameters: CertificateParameters;
  result?: CertificateResult;
};
