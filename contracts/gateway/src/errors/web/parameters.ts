import { IncorrectTypeError, InvalidTypeError, TypeError } from '@ez4/common/library';

export class InvalidParameterTypeError extends InvalidTypeError {
  constructor(
    public baseType: string,
    fileName?: string
  ) {
    super('Invalid path parameters', undefined, baseType, fileName);
  }
}

export class IncorrectParameterTypeError extends IncorrectTypeError {
  constructor(
    public parametersType: string,
    public baseType: string,
    fileName?: string
  ) {
    super('Incorrect path parameters', parametersType, baseType, fileName);
  }
}

export class MismatchParametersTypeError extends TypeError {
  constructor(
    public parameterNames: string[],
    fileName?: string
  ) {
    if (parameterNames.length > 1) {
      super(`Path parameters ${parameterNames} are a mismatch.`, fileName);
    } else {
      super(`Path parameter ${parameterNames} is a mismatch.`, fileName);
    }
  }
}
