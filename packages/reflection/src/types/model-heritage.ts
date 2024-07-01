import type { EveryMemberType } from './model-members.js';

export type ModelHeritage = {
  path: string;
  namespace?: string;
  members?: EveryMemberType[];
};
