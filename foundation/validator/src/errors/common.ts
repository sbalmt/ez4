export class ValidationError extends Error {
  constructor(
    message: string,
    public propertyName?: string,
    public inputValue?: unknown,
    public inputError?: Error
  ) {
    super(message, {
      cause: inputError
    });
  }
}

export class UnexpectedPropertiesError extends ValidationError {
  constructor(
    public propertyNames: string[],
    propertyName?: string,
    inputValue?: unknown
  ) {
    if (propertyNames.length === 1) {
      super(`Property [${propertyNames[0]}] is not expected.`, propertyName, inputValue);
    } else if (propertyNames.length < 15) {
      super(`Properties [${propertyNames.join(', ')}] are not expected.`, propertyName, inputValue);
    } else {
      super(`Remove all unexpected properties.`, propertyName, inputValue);
    }
  }
}

export class UnexpectedValueError extends ValidationError {
  constructor(
    public formattedValue: string,
    propertyName?: string,
    public expectedValue: unknown = formattedValue,
    inputValue?: unknown
  ) {
    if (propertyName) {
      super(`Value ${formattedValue} for [${propertyName}] is expected.`, propertyName, inputValue);
    } else {
      super(`Value ${formattedValue} is expected.`, propertyName, inputValue);
    }
  }
}

export class UnexpectedTypeError extends ValidationError {
  constructor(
    public typeName: string,
    propertyName?: string,
    inputValue?: unknown
  ) {
    if (propertyName) {
      super(`Type ${typeName} for [${propertyName}] is expected.`, propertyName, inputValue);
    } else {
      super(`Type ${typeName} is expected.`, propertyName, inputValue);
    }
  }
}

export class UnexpectedFormatError extends ValidationError {
  constructor(
    public typeName: string,
    public formatName: string,
    public formatHint?: string,
    propertyName?: string,
    inputValue?: unknown
  ) {
    if (propertyName && formatHint) {
      super(`Type ${typeName} with format ${formatName} (${formatHint}) for [${propertyName}] is expected.`, propertyName, inputValue);
    } else if (propertyName) {
      super(`Type ${typeName} with format ${formatName} for [${propertyName}] is expected.`, propertyName, inputValue);
    } else {
      super(`Type ${typeName} with format ${formatName} is expected.`, propertyName, inputValue);
    }
  }
}
