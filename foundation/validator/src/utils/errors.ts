import {
  ValidationError,
  UnexpectedFormatError,
  UnexpectedPropertiesError,
  UnexpectedTypeError,
  UnexpectedValueError
} from '../errors/common';

/**
 * Error details
 */
export type ErrorDetails = {
  code: string;
  path?: string;
  message: string;
  properties?: string[];
  input?: unknown;
  expected?: {
    value?: unknown;
    format?: string;
    type?: string;
  };
};

/**
 * Get all the error details from the given error list.
 *
 * @param errorList Error list.
 * @returns Returns an array containing the error details.
 */
export const getErrorDetails = (errorList: Error[]) => {
  const errorDetails: ErrorDetails[] = [];
  const errorSet = new Set<string>();

  for (const error of errorList) {
    const code = (error.cause ?? error).constructor.name;
    const message = error.message;

    if (errorSet.has(message)) {
      continue;
    }

    errorSet.add(message);

    if (error instanceof UnexpectedPropertiesError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        properties: error.propertyNames,
        input: error.inputValue
      });

      continue;
    }

    if (error instanceof UnexpectedFormatError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        input: error.inputValue,
        expected: {
          format: error.formatName,
          type: error.typeName
        }
      });

      continue;
    }

    if (error instanceof UnexpectedValueError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        input: error.inputValue,
        expected: {
          value: error.expectedValue
        }
      });

      continue;
    }

    if (error instanceof UnexpectedTypeError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        input: error.inputValue,
        expected: {
          type: error.typeName
        }
      });

      continue;
    }

    if (error instanceof ValidationError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        input: error.inputValue
      });

      continue;
    }

    errorDetails.push({
      code,
      message
    });
  }

  return errorDetails;
};
