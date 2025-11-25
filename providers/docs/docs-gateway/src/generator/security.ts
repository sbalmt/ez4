import type { HttpAuthRequest, HttpService } from '@ez4/gateway/library';

import { getIndentedOutput, getNameOutput } from '../utils/format';
import { isEmptyObject } from '@ez4/utils';

export const getSecurityOutput = (service: HttpService) => {
  const output: Record<string, string[]> = {};

  for (const route of service.routes) {
    const { authorizer } = route;

    if (!authorizer?.request) {
      continue;
    }

    const { name, request } = authorizer;

    if (output[name]) {
      continue;
    }

    output[name] = getAuthorizationOutput(request);
  }

  if (isEmptyObject(output)) {
    return [];
  }

  return [
    'securitySchemes:',
    ...getIndentedOutput(Object.entries(output).flatMap(([path, lines]) => [`${path}:`, ...getIndentedOutput(lines)])),
    ''
  ];
};

const getAuthorizationOutput = (request: HttpAuthRequest) => {
  const output = [];

  if (request.headers?.properties) {
    for (const headerKey in request.headers.properties) {
      if (headerKey.toLowerCase() !== 'authorization') {
        output.push(`type: apiKey`, 'in: header', `name: ${getNameOutput(headerKey)}`);
      } else {
        output.push(`type: http`, 'scheme: bearer', `bearerFormat: JWT`);
      }
    }
  }

  if (request.query?.properties) {
    for (const queryKey in request.query.properties) {
      output.push(`type: apiKey`, 'in: query', `name: ${getNameOutput(queryKey)}`);
    }
  }

  return output;
};
