import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidPreferencesTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid preferences', undefined, baseType, fileName);
  }
}

export class IncorrectPreferencesTypeError extends IncorrectTypeError {
  constructor(
    public preferencesType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect preferences', preferencesType, baseType, fileName);
  }
}
