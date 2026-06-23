import { IncorrectTypeError, InvalidTypeError, IncompleteTypeError } from '@ez4/common/library';

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

export class IncompleteRewriteRuleError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CDN rewrite rule', properties, fileName);
  }
}

export class InvalidRewriteStatusError extends Error {
  constructor(
    public status: number,
    fileName?: string
  ) {
    super(`Invalid CDN rewrite status '${status}'. Expected 301 or 302.${fileName ? ` (${fileName})` : ''}`);
  }
}
