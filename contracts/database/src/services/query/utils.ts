import type { IsNullable } from '@ez4/utils';

export type PreserveNull<T, U> = IsNullable<T> extends true ? null | U : U;
