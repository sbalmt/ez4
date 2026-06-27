import type { ManifestAction } from '@ez4/project/library';
import type { ObjectSchema } from '@ez4/schema';

export type RequestInput = {
  host: string;
  workspace: string;
  action: ManifestAction<ObjectSchema>;
};
