import type { HttpService } from '@ez4/gateway/library';

import { isEmptyObject } from '@ez4/utils';

import { getIndentedOutput } from '../utils/format';
import { getAnySchemaOutput } from '../schema/any';

export const getRequestOutput = (service: HttpService) => {
  const output: Record<string, string[]> = {};

  const defaultPreferences = service.defaults?.preferences;

  for (const route of service.routes) {
    const { preferences, handler } = route;
    const { name, request } = handler;

    if (!request?.body || output[name]) {
      continue;
    }

    const namingStyle = preferences?.namingStyle ?? defaultPreferences?.namingStyle;

    output[name] = getAnySchemaOutput(request.body, namingStyle);
  }

  if (isEmptyObject(output)) {
    return [];
  }

  return [
    'requestSchemes:',
    ...getIndentedOutput(Object.entries(output).flatMap(([path, lines]) => [`${path}:`, ...getIndentedOutput(lines)])),
    ''
  ];
};
