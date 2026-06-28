import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type ActionInput = {
  host: string;
  location: string;
  action: ManifestAction<ObjectSchema>;
  id: string;
};
