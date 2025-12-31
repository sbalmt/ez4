import { RuntimeType } from '@ez4/project';
import { FunctionRuntime } from '../types/runtime';

const TRANSLATION: Record<RuntimeType, FunctionRuntime> = {
  [RuntimeType.Node22]: FunctionRuntime.Node22,
  [RuntimeType.Node24]: FunctionRuntime.Node24
};

export const getFunctionRuntime = (runtime: RuntimeType) => {
  return TRANSLATION[runtime];
};
