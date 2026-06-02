import { UnexpectedFormatError, UnexpectedPropertiesError, UnexpectedTypeError, UnexpectedValueError } from '../errors/common';

/**
 * Error details
 */
export type ErrorDetails = {
  code: string;
  message: string;
  properties?: string[];
  path?: string;
  values?: unknown[];
  format?: string;
  type?: string;
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
    const message = error.message;
    const code = error.name;

    if (errorSet.has(message)) {
      continue;
    }

    errorSet.add(message);

    if (error instanceof UnexpectedPropertiesError) {
      errorDetails.push({
        code,
        message,
        properties: error.propertyNames
      });

      continue;
    }

    if (error instanceof UnexpectedValueError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        values: error.rawValues
      });

      continue;
    }

    if (error instanceof UnexpectedFormatError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        format: error.formatName,
        type: error.typeName
      });

      continue;
    }

    if (error instanceof UnexpectedTypeError) {
      errorDetails.push({
        code,
        message,
        path: error.propertyName,
        type: error.typeName
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
