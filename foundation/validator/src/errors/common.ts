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
    public values: string[],
    public propertyName?: string,
    public rawValues: unknown[] = values
  ) {
    if (values.length === 1) {
      if (propertyName) {
        super(`Value ${values[0]} for [${propertyName}] is expected.`);
      } else {
        super(`Value ${values[0]} is expected.`);
      }
    } else {
      if (propertyName) {
        super(`A value in [${values.join(', ')}] for ${propertyName} is expected.`);
      } else {
        super(`A value in [${values.join(', ')}] is expected.`);
      }
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
    public propertyName?: string
  ) {
    if (propertyName) {
      super(`Type ${typeName} with format ${formatName} for [${propertyName}] is expected.`);
    } else {
      super(`Type ${typeName} with format ${formatName} is expected.`);
    }
  }
}
