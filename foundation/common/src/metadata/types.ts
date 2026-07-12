import type { ServiceMetadata } from '@ez4/project/library';

export const ServiceType = '@ez4/common';

export const enum ServiceName {
  Variables = '@variables',
  Options = '@options'
}

export const isCommonService = (service: ServiceMetadata) => {
  return service.type === ServiceType;
};
