import type { ServiceMetadata } from '@ez4/project/library';

export const isCommonService = (service: ServiceMetadata) => {
  return service.type === '@ez4/common';
};
