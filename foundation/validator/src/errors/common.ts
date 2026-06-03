export class UnexpectedPropertiesError extends Error {
  public name = 'UnexpectedProperties';

  constructor(public propertyNames: string[]) {
    if (propertyNames.length === 1) {
      super(`Property [${propertyNames[0]}] is not expected.`);
    } else if (propertyNames.length < 15) {
      super(`Properties [${propertyNames.join(', ')}] are not expected.`);
    } else {
      super(`Remove all unexpected properties.`);
    }
  }
}

export class UnexpectedValueError extends Error {
  public name = 'UnexpectedValue';

  constructor(
    public formattedValue: string,
    public propertyName?: string,
    public rawValue: unknown = formattedValue
  ) {
    if (propertyName) {
      super(`Value ${formattedValue} for [${propertyName}] is expected.`);
    } else {
      super(`Value ${formattedValue} is expected.`);
    }
  }
}

export class UnexpectedTypeError extends Error {
  public name = 'UnexpectedType';

  constructor(
    public typeName: string,
    public propertyName?: string
  ) {
    if (propertyName) {
      super(`Type ${typeName} for [${propertyName}] is expected.`);
    } else {
      super(`Type ${typeName} is expected.`);
    }
  }
}

export class UnexpectedFormatError extends Error {
  public name = 'UnexpectedFormat';

  constructor(
    public typeName: string,
    public formatName: string,
    public formatHint?: string,
    public propertyName?: string
  ) {
    if (propertyName && formatHint) {
      super(`Type ${typeName} with format ${formatName} (${formatHint}) for [${propertyName}] is expected.`);
    } else if (propertyName) {
      super(`Type ${typeName} with format ${formatName} for [${propertyName}] is expected.`);
    } else {
      super(`Type ${typeName} with format ${formatName} is expected.`);
    }
  }
}
