import { HttpAuthorizer, HttpHandler, HttpService } from '@ez4/gateway/library';

export const getServiceName = (service: HttpService, prefix: string) => {
  return `${prefix}-${service.name}`;
};

export const getFunctionName = (
  service: HttpService,
  functionType: HttpHandler | HttpAuthorizer,
  prefix: string
) => {
  return `${getServiceName(service, prefix)}-${functionType.name}`;
};
