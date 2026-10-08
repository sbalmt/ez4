import type { AnyObject } from '@ez4/utils';
import type { ServiceFactories } from './service';

export type ProviderOptions<T extends AnyObject> = {
  eventTypes: string[];
  eventHandler: (event: string, payload: T | undefined) => Promise<unknown> | unknown | void;
};

export type ProviderContext = {
  notify: (event: string, payload: AnyObject) => void;
  request: (event: string, payload: AnyObject) => Promise<unknown>;
  services: ServiceFactories;
};
