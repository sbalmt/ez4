import type { MappingParameters as BaseMappingParameters } from '@ez4/aws-function';
import type { StreamChangeType } from '@ez4/database';

export type MappingParameters = Omit<BaseMappingParameters, 'getSourceArn'> & {
  triggers?: StreamChangeType[];
};
