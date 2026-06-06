import type { TypeName, TypeTag } from './common';

export type EnumMember = EnumStringMember | EnumNumberMember;

type EnumBaseMember = {
  name: string;
  description?: string;
  tags?: TypeTag[];
};

export type EnumStringMember = EnumBaseMember & {
  type: TypeName.String;
  value: string;
};

export type EnumNumberMember = EnumBaseMember & {
  type: TypeName.Number;
  value: number;
};
