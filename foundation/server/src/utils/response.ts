import type { AnyObject } from '@ez4/utils';
import type { HttpProviderResponse } from '../types/provider';

export const getSuccessResponse = (status: number, headers?: AnyObject, type?: string, data?: string): HttpProviderResponse => {
  return {
    status,
    headers: {
      ...headers,
      ...(type && {
        ['content-type']: type
      })
    },
    ...(data && {
      body: data
    })
  };
};

export const getErrorResponse = (status: number, error: AnyObject): HttpProviderResponse => {
  return {
    status,
    body: JSON.stringify(error),
    headers: {
      ['content-type']: 'application/json'
    }
  };
};
