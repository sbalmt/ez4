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

export type ManifestAction<T extends AnyObject> = {
  name: string;
  type: ManifestActionType;
  description?: string;
  group?: string;
  path: string;
  sources?: ManifestSource[];
  request?: {
    identity?: T;
    parameters?: T;
    query?: T;
    headers?: T;
    body?: T;
  };
  response?: {
    headers?: T;
    body?: T;
  };
};

export type ManifestSource = {
  file: string;
};

export type ServiceManifest<T extends AnyObject> = {
  actions: ManifestAction<T>[];
  host: string;
};

export type EmulatorServiceManifest<T extends AnyObject> = {
  actions: ManifestAction<T>[];
};
