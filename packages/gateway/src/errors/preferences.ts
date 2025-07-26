import { IncorrectTypeError, InvalidTypeError } from '@ez4/common/library';

export class InvalidPreferencesTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid preferences', undefined, 'Http.Preferences', fileName);
  }
}

export class IncorrectPreferencesTypeError extends IncorrectTypeError {
  constructor(
    public preferencesType: string,
    fileName?: string
  ) {
    super('Incorrect preferences', preferencesType, 'Http.Preferences', fileName);
  }
}
