import type { ModelProperty } from '@ez4/reflection';

import { getPropertyStringIn } from '../reflection/property';
import { ServiceArchitecture } from '../types/architecture';

export const getServiceArchitecture = (member: ModelProperty) => {
  return getPropertyStringIn(member, [ServiceArchitecture.Arm, ServiceArchitecture.x86]);
};
