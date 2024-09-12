import type { Incomplete } from '@ez4/utils';
import type { SourceMap } from '@ez4/reflection';
import type { BucketService } from '../types/service.js';

import { ServiceType } from '../types/service.js';
import { IncompleteServiceError } from '../errors/service.js';
import { isBucketService } from './utils.js';

export const getBucketServices = (reflection: SourceMap) => {
  const bucketServices: Record<string, BucketService> = {};
  const errorList: Error[] = [];

  for (const identity in reflection) {
    const statement = reflection[identity];

    if (!isBucketService(statement)) {
      continue;
    }

    const service: Incomplete<BucketService> = { type: ServiceType };

    service.name = statement.name;

    if (statement.description) {
      service.description = statement.description;
    }

    if (!isValidService(service)) {
      errorList.push(new IncompleteServiceError([], statement.file));
      continue;
    }

    bucketServices[statement.name] = service;
  }

  return {
    services: bucketServices,
    errors: errorList
  };
};

const isValidService = (type: Incomplete<BucketService>): type is BucketService => {
  return !!type.name;
};
