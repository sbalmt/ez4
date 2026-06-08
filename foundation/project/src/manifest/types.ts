import type { AnyObject } from '@ez4/utils';

export const enum ManifestActionType {
  Post = 'post'
}

export type ManifestAction = {
  type: ManifestActionType;
  schema?: AnyObject;
};

export type ServiceManifest = {
  actions: ManifestAction[];
};
