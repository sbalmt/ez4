import type { AnyObject } from '@ez4/utils';

export const enum ManifestActionType {
  None = 'none',
  Head = 'head',
  Get = 'get',
  Post = 'post',
  Delete = 'delete',
  Patch = 'patch',
  Put = 'put'
}

export type ManifestAction = {
  type: ManifestActionType;
  name: string;
  path?: string;
  description?: string;
  identity?: AnyObject;
  parameters?: AnyObject;
  query?: AnyObject;
  headers?: AnyObject;
  body?: AnyObject;
};

export type ServiceManifest = {
  actions: ManifestAction[];
  host: string;
};

export type EmulatorServiceManifest = {
  actions: ManifestAction[];
};
