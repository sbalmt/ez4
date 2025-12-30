import { ArchitectureType } from '@ez4/common';
import { FunctionArchitecture } from '../types/architecture';

const TRANSLATION: Record<ArchitectureType, FunctionArchitecture> = {
  [ArchitectureType.Arm]: FunctionArchitecture.Arm,
  [ArchitectureType.x86]: FunctionArchitecture.x86
};

export const getFunctionArchitecture = (architecture: ArchitectureType) => {
  return TRANSLATION[architecture];
};
