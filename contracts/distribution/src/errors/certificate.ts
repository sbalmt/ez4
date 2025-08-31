import { IncompleteTypeError, IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class IncompleteCertificateError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CDN certificate', properties, fileName);
  }
}

export class InvalidCertificateTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid CDN certificate type', undefined, 'Cdn.Certificate', fileName);
  }
}

export class IncorrectCertificateTypeError extends IncorrectTypeError {
  constructor(
    public certificateType: string,
    fileName?: string
  ) {
    super('Incorrect CDN certificate type', certificateType, 'Cdn.Certificate', fileName);
  }
}
