import type { AnyObject } from '@ez4/utils';
import type { ServiceFactories } from './service';

export type ProviderOptions<T extends AnyObject> = {
  eventTypes: string[];
  eventHandler: (payload: T | undefined) => Promise<void> | void;
};

export type ProviderContext = {
  notify: (event: string, payload: AnyObject) => void;
  services: ServiceFactories;
};
