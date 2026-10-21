import type { Client } from '@ez4/cache';
import type { ModuleInvocation } from '@ez4/emulator';

export const makeInvoker = () => {
  return (invocation: ModuleInvocation) => invocation.invoke(invocation.request);
};

export const cacheHandler = async ({ value }: { value: string }, { cache }: { cache: Client }) => {
  await cache.set('worker', value);

  return cache.get('worker');
};
