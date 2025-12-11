import type { AnyObject } from '@ez4/utils';

export const getSuccessResponse = (status: number, headers?: AnyObject, contentType?: string, contentData?: string) => {
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

export const getErrorResponse = (status: number, errorBody: AnyObject) => {
  return {
    status,
    body: JSON.stringify(errorBody),
    headers: {
      ['content-type']: 'application/json'
    }
  };
};
