import type { EveryMemberType } from './model-members';

export type ModelHeritage = {
  path: string;
  namespace?: string;
  members?: EveryMemberType[];
};
