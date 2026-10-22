import type { ModuleInvocation } from '@ez4/emulator';

export const makeInvoker = () => {
  return (invocation: ModuleInvocation) => {
    return invocation.invoke(invocation.request);
  };
};
