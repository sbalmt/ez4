import type { StageParameters } from '../types';

import { toKebabCase } from '@ez4/utils';

export const getStageName = (parameters: StageParameters) => {
  return parameters.stageName ? toKebabCase(parameters.stageName) : '$default';
};
