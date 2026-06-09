import type { AnyObject } from '@ez4/utils';

export const enum ManifestActionType {
  None = 'none',
  Head = 'head',
  Get = 'get',
  Post = 'post',
  Put = 'put',
  Patch = 'path'
}

export type ManifestAction = {
  type: ManifestActionType;
  name: string;
  path?: string;
  identity?: AnyObject;
  parameters?: AnyObject;
  query?: AnyObject;
  headers?: AnyObject;
  body?: AnyObject;
};

export type ServiceManifest = {
  actions: ManifestAction[];
};
