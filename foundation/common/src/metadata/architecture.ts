import type { ModelProperty } from '@ez4/reflection';

import { getPropertyStringIn } from '../reflection/property';
import { ArchitectureType } from '../types/architecture';

export const getServiceArchitecture = (member: ModelProperty) => {
  return getPropertyStringIn(member, [ArchitectureType.Arm, ArchitectureType.x86]);
};
