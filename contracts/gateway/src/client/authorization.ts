import type { HttpImport } from '@ez4/gateway/library';

import { AuthorizationType } from '../services/authorization';

export type ClientAuthorization = {
  header: string;
  value: string;
};

export const getClientAuthorization = (service: HttpImport): ClientAuthorization | undefined => {
  const { authorization } = service;

  if (!authorization) {
    return undefined;
  }

  switch (authorization.type) {
    default:
      throw new Error(`Authorization type ${authorization.type} isn't supported.`);

    case AuthorizationType.Bearer:
      return {
        header: authorization.header,
        value: `Bearer ${authorization.value}`
      };
  }
};
