import { base64Decode, isAnyString } from '@ez4/utils';

export const tryDecodeBase64Json = (value: unknown) => {
  if (isAnyString(value)) {
    try {
      return JSON.parse(base64Decode(value));
    } catch {
      return undefined;
    }
  }

  return value;
};
