import { IncorrectTypeError, InvalidTypeError, IncompleteTypeError, UnexpectedValueError } from '@ez4/common/library';

export class InvalidRewriteRuleTypeError extends InvalidTypeError {
  constructor(fileName?: string) {
    super('Invalid CDN rewrite rule type', undefined, 'Cdn.RewriteRule', fileName);
  }
}

export class IncorrectRewriteRuleTypeError extends IncorrectTypeError {
  constructor(
    public rewriteRuleType: string,
    fileName?: string
  ) {
    super('Incorrect CDN rewrite rule type', rewriteRuleType, 'Cdn.RewriteRule', fileName);
  }
}

export class IncompleteRewriteRuleError extends IncompleteTypeError {
  constructor(properties: string[], fileName?: string) {
    super('Incomplete CDN rewrite rule', properties, fileName);
  }
}

export class InvalidRewriteStatusError extends UnexpectedValueError {
  constructor(
    public status: number,
    fileName?: string
  ) {
    super(`Invalid CDN rewrite status`, 'status', status.toString(), fileName);
  }
}
