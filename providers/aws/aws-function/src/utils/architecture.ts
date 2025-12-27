import { ServiceArchitecture } from '@ez4/common';
import { FunctionArchitecture } from '../types/architecture';

const TRANSLATION: Record<ServiceArchitecture, FunctionArchitecture> = {
  [ServiceArchitecture.Arm]: FunctionArchitecture.Arm,
  [ServiceArchitecture.x86]: FunctionArchitecture.x86
};

export const getFunctionArchitecture = (architecture: ServiceArchitecture) => {
  return TRANSLATION[architecture];
};
