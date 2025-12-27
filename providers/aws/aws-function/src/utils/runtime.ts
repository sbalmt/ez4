import { ServiceRuntime } from '@ez4/common';
import { FunctionRuntime } from '../types/runtime';

const TRANSLATION: Record<ServiceRuntime, FunctionRuntime> = {
  [ServiceRuntime.Node22]: FunctionRuntime.Node22,
  [ServiceRuntime.Node24]: FunctionRuntime.Node24
};

export const getFunctionRuntime = (runtime: ServiceRuntime) => {
  return TRANSLATION[runtime];
};
