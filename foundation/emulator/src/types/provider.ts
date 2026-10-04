import type { AnyObject } from '@ez4/utils';

export type ProviderOptions<T extends AnyObject> = {
  eventTypes: string[];
  eventHandler: (payload: T | undefined) => Promise<void> | void;
};

export type ProviderContext = {
  notify: (event: string, payload: AnyObject) => void;
  services: AnyObject;
};
