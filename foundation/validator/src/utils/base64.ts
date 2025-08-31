import { isAnyString } from '@ez4/utils';

export const tryDecodeBase64Json = (value: unknown) => {
  if (isAnyString(value)) {
    try {
      const decodedValue = Buffer.from(value, 'base64');
      return JSON.parse(decodedValue.toString('utf8'));
    } catch {
      return undefined;
    }
  }

  return value;
};
