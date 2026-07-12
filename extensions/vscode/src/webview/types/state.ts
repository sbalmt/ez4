import type { AnyObject } from '@ez4/utils';

export type RequestState = {
  headers?: Record<string, string>;
  parameters?: Record<string, string>;
  query?: Record<string, string>;
  body?: AnyObject | string;
  model?: string;
};
