import type { ModelProperty } from '@ez4/reflection';

import { ArchitectureType } from '@ez4/project';

import { getPropertyStringIn } from '../reflection/property';

export const getServiceArchitecture = (member: ModelProperty) => {
  return getPropertyStringIn(member, [ArchitectureType.Arm, ArchitectureType.x86]);
};
