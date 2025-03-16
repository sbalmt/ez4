import type { Headers } from '../../types/headers.js';

import { hashData } from '@ez4/utils';

export const protectHeaders = (headers: Headers) => {
  const output: Headers = {};

  for (const name in headers) {
    output[name] = hashData(headers[name]);
  }

  return output;
};
