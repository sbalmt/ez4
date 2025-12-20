import type { HttpService } from '@ez4/gateway/library';

import { getIndentedOutput } from '../utils/format';
import { getServiceRoutesOutput } from './route';
import { getSecurityOutput } from './security';
import { getRequestOutput } from './request';
import { getResponseOutput } from './response';

export namespace OpenApiGenerator {
  export const getGatewayOutput = (service: HttpService) => {
    const output = [
      '# Auto-generated Open API specification, any manual modifications will be lost during regeneration.',
      'openapi: 3.1.0'
    ];

    output.push(...getInformationOutput(service));
    output.push(...getServiceRoutesOutput(service));

    const components = [...getSecurityOutput(service), ...getRequestOutput(service), ...getResponseOutput(service)];

    if (components.length) {
      output.push('components:', ...getIndentedOutput(components));
    }

    return output.join('\n');
  };

  const getInformationOutput = (service: HttpService) => {
    return ['info:', ...getIndentedOutput([`title: ${service.displayName ?? service.name}`, 'version: 1.0.0']), ''];
  };
}
