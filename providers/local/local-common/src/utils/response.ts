import type { AnyObject } from '@ez4/utils';

export const getResponseSuccess = (status: number, headers?: AnyObject, contentType?: string, contentData?: string) => {
  return {
    status,
    headers: {
      ...headers,
      ...(contentType && {
        ['content-type']: contentType
      })
    },
    ...(contentData && {
      body: contentData
    })
  };
};

export const getResponseError = (status: number, errorData: AnyObject) => {
  return {
    status,
    body: JSON.stringify(errorData),
    headers: {
      ['content-type']: 'application/json'
    }
  };
};
