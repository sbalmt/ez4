import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidRewriteTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid CDN rewrite type', undefined, 'Cdn.Rewrite', fileName);
  }
}

export class IncorrectRewriteTypeError extends IncorrectTypeError {
  constructor(
    public fallbackType: string,
    fileName?: string
  ) {
    super('Incorrect CDN rewrite type', fallbackType, 'Cdn.Rewrite', fileName);
  }
}
