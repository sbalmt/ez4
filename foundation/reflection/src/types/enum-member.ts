import type { TypeName } from './common.js';

export type EnumMember = EnumStringMember | EnumNumberMember;

type EnumBaseMember = {
  name: string;
  description?: string;
};

export type EnumStringMember = EnumBaseMember & {
  type: TypeName.String;
  value: string;
};

export type EnumNumberMember = EnumBaseMember & {
  type: TypeName.Number;
  value: number;
};
