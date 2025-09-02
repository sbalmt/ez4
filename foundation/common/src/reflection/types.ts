import type { EveryMemberType } from '@ez4/reflection';

export type MemberType = EveryMemberType & {
  inherited: boolean;
};
