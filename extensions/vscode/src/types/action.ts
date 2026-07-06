import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type ActionInput = {
  id: string;
  host: string;
  action: ManifestAction<ObjectSchema>;
  location: string;
  service: string;
};
