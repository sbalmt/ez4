import type { MappingParameters as BaseMappingParameters } from '@ez4/aws-function';

export type MappingParameters = Omit<BaseMappingParameters, 'getSourceArn'>;
